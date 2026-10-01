(() => {
  "use strict";

  const STORAGE_KEY = "saturnLoanDataV1";
  const SESSION_KEY = "saturnLoanAdminSession";

  const DEFAULT_DATA = {
    games: [
      { id: "g1", title: "Mario Kart 8 Deluxe", platform: "Nintendo Switch", code: "SL-001", condition: "Bueno", notes: "Cartucho + caja.", coverA: "#f97316", coverB: "#ef4444" },
      { id: "g2", title: "Pokémon Rubí", platform: "Game Boy Advance", code: "SL-002", condition: "Aceptable", notes: "Cartucho original. Sin caja.", coverA: "#ef4444", coverB: "#be123c" },
      { id: "g3", title: "The Legend of Zelda: Breath of the Wild", platform: "Nintendo Switch", code: "SL-003", condition: "Perfecto", notes: "Cartucho + caja.", coverA: "#10b981", coverB: "#0ea5e9" },
      { id: "g4", title: "Minecraft", platform: "Nintendo Switch", code: "SL-004", condition: "Bueno", notes: "Edición física.", coverA: "#84cc16", coverB: "#15803d" },
      { id: "g5", title: "Animal Crossing: New Horizons", platform: "Nintendo Switch", code: "SL-005", condition: "Perfecto", notes: "Cartucho + caja.", coverA: "#22c55e", coverB: "#06b6d4" },
      { id: "g6", title: "Mario & Luigi RPG", platform: "Nintendo DS", code: "SL-006", condition: "Bueno", notes: "Cartucho original.", coverA: "#3b82f6", coverB: "#7c3aed" }
    ],
    loans: []
  };

  let data = loadData();
  let isAdmin = localStorage.getItem(SESSION_KEY) === "true";

  const $ = (id) => document.getElementById(id);

  function loadData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
        return structuredClone(DEFAULT_DATA);
      }
      const parsed = JSON.parse(saved);
      if (!parsed.games || !parsed.loans) throw new Error("Datos incompletos");
      return parsed;
    } catch (error) {
      console.warn("No se pudieron cargar los datos guardados. Se usarán los datos iniciales.", error);
      return structuredClone(DEFAULT_DATA);
    }
  }

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function dateFromInput(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function formatDate(dateString) {
    const d = dateFromInput(dateString);
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function toISODate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function addDays(dateString, days) {
    const d = dateFromInput(dateString);
    d.setDate(d.getDate() + Number(days));
    return toISODate(d);
  }

  function todayISO() {
    return toISODate(new Date());
  }

  function priceForDays(days) {
    if (Number(days) <= 7) return 1;
    if (Number(days) <= 14) return 2;
    return 3;
  }

  function daysLate(dueDate) {
    const today = dateFromInput(todayISO());
    const due = dateFromInput(dueDate);
    const ms = today.getTime() - due.getTime();
    return Math.max(0, Math.floor(ms / 86400000));
  }

  function activeLoanForGame(gameId) {
    return data.loans.find((loan) => loan.gameId === gameId && !loan.returnedAt);
  }

  function updateSessionUI() {
    $("sessionBadge").textContent = isAdmin ? "Administrador" : "Invitado";
    $("sessionBadge").className = `session-badge ${isAdmin ? "admin" : "guest"}`;
    $("adminButton").textContent = isAdmin ? "Salir de administrador" : "Administrador";
    document.querySelectorAll(".admin-only").forEach((el) => el.classList.toggle("hidden", !isAdmin));
    renderAll();
  }

  function renderStats() {
    const games = data.games.length;
    const loaned = data.games.filter((g) => activeLoanForGame(g.id)).length;
    const available = games - loaned;
    const activeLoans = data.loans.filter((loan) => !loan.returnedAt).length;

    $("statGames").textContent = games;
    $("statAvailable").textContent = available;
    $("statLoaned").textContent = loaned;
    $("statActiveLoans").textContent = activeLoans;
    $("heroAvailable").textContent = `${available} ${available === 1 ? "juego disponible" : "juegos disponibles"}`;
    $("heroLoans").textContent = `${activeLoans} ${activeLoans === 1 ? "préstamo activo" : "préstamos activos"}`;
  }

  function renderPlatformFilter() {
    const current = $("platformFilter").value;
    const platforms = [...new Set(data.games.map((g) => g.platform.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    $("platformFilter").innerHTML = `<option value="all">Todas las plataformas</option>` +
      platforms.map((p) => `<option value="${escapeHTML(p)}">${escapeHTML(p)}</option>`).join("");
    if (platforms.includes(current)) $("platformFilter").value = current;
  }

  function renderGames() {
    const search = $("gameSearch").value.trim().toLowerCase();
    const platform = $("platformFilter").value;
    const availability = $("availabilityFilter").value;

    const games = data.games.filter((game) => {
      const loan = activeLoanForGame(game.id);
      const isAvailable = !loan;
      const matchesSearch = [game.title, game.platform, game.code].join(" ").toLowerCase().includes(search);
      const matchesPlatform = platform === "all" || game.platform === platform;
      const matchesAvailability =
        availability === "all" ||
        (availability === "available" && isAvailable) ||
        (availability === "loaned" && !isAvailable);
      return matchesSearch && matchesPlatform && matchesAvailability;
    });

    $("gameGrid").innerHTML = games.map((game) => {
      const loan = activeLoanForGame(game.id);
      const status = loan
        ? `<span class="status-chip status-loaned">Prestado a ${escapeHTML(loan.person)}</span>`
        : `<span class="status-chip status-available">Disponible</span>`;

      const actions = isAdmin
        ? `<div class="card-actions">
            <button class="btn btn-secondary" data-edit-game="${game.id}">Editar</button>
            <button class="btn btn-secondary" data-delete-game="${game.id}">Eliminar</button>
          </div>`
        : "";

      return `
        <article class="game-card">
          <div class="cover" style="--cover-a:${escapeHTML(game.coverA || "#4f46e5")};--cover-b:${escapeHTML(game.coverB || "#06b6d4")}">
            <div class="cover-title">${escapeHTML(game.title)}</div>
          </div>
          <div class="game-body">
            <div class="platform">${escapeHTML(game.platform)} · ${escapeHTML(game.code)}</div>
            <div class="game-meta">
              <strong>${escapeHTML(game.condition)}</strong>
              ${status}
            </div>
            <div class="game-notes">${escapeHTML(game.notes || "Sin notas.")}</div>
            ${actions}
          </div>
        </article>`;
    }).join("");

    $("catalogEmpty").classList.toggle("hidden", games.length !== 0);
  }

  function renderLoans() {
    const loans = [...data.loans].sort((a, b) => {
      if (a.returnedAt && !b.returnedAt) return 1;
      if (!a.returnedAt && b.returnedAt) return -1;
      return b.startDate.localeCompare(a.startDate);
    });

    if (!isAdmin) {
      $("loansPanel").innerHTML = `
        <div class="empty-state" style="border:0;border-radius:0">
          <div class="empty-icon">🔒</div>
          <h3>Zona privada</h3>
          <p>Inicia sesión como administrador para consultar y gestionar los préstamos.</p>
        </div>`;
      return;
    }

    if (!loans.length) {
      $("loansPanel").innerHTML = `
        <div class="empty-state" style="border:0;border-radius:0">
          <div class="empty-icon">📚</div>
          <h3>Aún no hay préstamos</h3>
          <p>Cuando prestes un juego, aparecerá aquí con su fecha de devolución.</p>
        </div>`;
      return;
    }

    const rows = loans.map((loan) => {
      const game = data.games.find((g) => g.id === loan.gameId);
      const returned = Boolean(loan.returnedAt);
      const late = !returned && daysLate(loan.dueDate) > 0;
      const lateFee = Math.min(daysLate(loan.dueDate) * 0.5, 5);

      return `<tr>
        <td><span class="loan-person">${escapeHTML(loan.person)}</span></td>
        <td>${game ? escapeHTML(game.title) : "Juego eliminado"}</td>
        <td>${formatDate(loan.startDate)}</td>
        <td class="${late ? "overdue" : returned ? "ok" : ""}">${formatDate(loan.dueDate)}</td>
        <td>${returned ? `<span class="ok">Devuelto ${formatDate(loan.returnedAt)}</span>` : late ? `<span class="overdue">${lateFee.toFixed(2).replace(".", ",")} € de recargo</span>` : `<span class="ok">En plazo</span>`}</td>
        <td class="table-actions">
          ${returned
            ? `<button data-delete-loan="${loan.id}">Borrar</button>`
            : `<button class="return-button" data-return-loan="${loan.id}">Marcar devolución</button>`
          }
        </td>
      </tr>`;
    }).join("");

    $("loansPanel").innerHTML = `
      <table class="loan-table">
        <thead>
          <tr>
            <th>Persona</th>
            <th>Juego</th>
            <th>Salida</th>
            <th>Devolución</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  function refreshLoanOptions() {
    const select = $("loanGame");
    const availableGames = data.games.filter((g) => !activeLoanForGame(g.id));

    select.innerHTML = availableGames.length
      ? availableGames.map((g) => `<option value="${g.id}">${escapeHTML(g.title)} · ${escapeHTML(g.platform)}</option>`).join("")
      : `<option value="">No hay juegos disponibles</option>`;

    $("newLoanButton").disabled = availableGames.length === 0;
  }

  function updateLoanPreview() {
    const start = $("loanStart").value || todayISO();
    const duration = Number($("loanDuration").value);
    const due = addDays(start, duration);
    const price = priceForDays(duration);

    $("loanPreview").innerHTML =
      `<strong>Resumen:</strong> ${duration} días · devolución el <strong>${formatDate(due)}</strong> · precio recomendado <strong>${price.toFixed(2).replace(".", ",")} €</strong>.`;
  }

  function renderAll() {
    renderStats();
    renderPlatformFilter();
    renderGames();
    renderLoans();
  }

  function openModal(id) {
    $(id).classList.remove("hidden");
    const firstField = $(id).querySelector("input:not([type=hidden]), select, textarea, button:not(.modal-close)");
    if (firstField) setTimeout(() => firstField.focus(), 50);
  }

  function closeModal(id) {
    $(id).classList.add("hidden");
  }

  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function createId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function resetGameForm() {
    $("gameForm").reset();
    $("gameId").value = "";
    $("gameModalTitle").textContent = "Añadir juego";
  }

  function openAddGame() {
    resetGameForm();
    openModal("gameModal");
  }

  function openEditGame(id) {
    const game = data.games.find((g) => g.id === id);
    if (!game) return;
    $("gameId").value = game.id;
    $("gameTitle").value = game.title;
    $("gamePlatform").value = game.platform;
    $("gameCode").value = game.code;
    $("gameCondition").value = game.condition;
    $("gameNotes").value = game.notes || "";
    $("gameModalTitle").textContent = "Editar juego";
    openModal("gameModal");
  }

  function deleteGame(id) {
    if (!isAdmin) return;
    const game = data.games.find((g) => g.id === id);
    if (!game) return;
    const hasActiveLoan = Boolean(activeLoanForGame(id));
    if (hasActiveLoan) {
      showToast("No puedes eliminar un juego que está prestado.");
      return;
    }
    if (!confirm(`¿Eliminar "${game.title}" del catálogo?`)) return;
    data.games = data.games.filter((g) => g.id !== id);
    saveData();
    renderAll();
    showToast("Juego eliminado.");
  }

  function markReturn(id) {
    const loan = data.loans.find((l) => l.id === id);
    if (!loan || loan.returnedAt) return;
    loan.returnedAt = todayISO();
    saveData();
    renderAll();
    showToast("Devolución registrada.");
  }

  function deleteLoan(id) {
    if (!confirm("¿Borrar este registro de préstamo?")) return;
    data.loans = data.loans.filter((l) => l.id !== id);
    saveData();
    renderAll();
    showToast("Registro eliminado.");
  }

  $("adminButton").addEventListener("click", () => {
    if (isAdmin) {
      isAdmin = false;
      localStorage.setItem(SESSION_KEY, "false");
      updateSessionUI();
      showToast("Has salido del modo administrador.");
      return;
    }
    $("adminPassword").value = "";
    openModal("adminModal");
  });

  $("adminLoginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const password = $("adminPassword").value.trim();
    if (password === "SATURNO2000") {
      isAdmin = true;
      localStorage.setItem(SESSION_KEY, "true");
      closeModal("adminModal");
      updateSessionUI();
      showToast("Modo administrador activado.");
    } else {
      showToast("Clave incorrecta.");
    }
  });

  $("addGameTopButton").addEventListener("click", openAddGame);
  $("newLoanButton").addEventListener("click", () => {
    refreshLoanOptions();
    $("loanStart").value = todayISO();
    updateLoanPreview();
    openModal("loanModal");
  });

  $("gameForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!isAdmin) return;

    const id = $("gameId").value;
    const title = $("gameTitle").value.trim();
    const platform = $("gamePlatform").value.trim();
    const code = $("gameCode").value.trim();
    const condition = $("gameCondition").value;
    const notes = $("gameNotes").value.trim();

    if (!title || !platform || !code) return;

    if (id) {
      const game = data.games.find((g) => g.id === id);
      if (!game) return;
      game.title = title;
      game.platform = platform;
      game.code = code;
      game.condition = condition;
      game.notes = notes;
    } else {
      data.games.unshift({
        id: createId("g"),
        title,
        platform,
        code,
        condition,
        notes,
        coverA: "#7c3aed",
        coverB: "#06b6d4"
      });
    }

    saveData();
    closeModal("gameModal");
    renderAll();
    showToast(id ? "Juego actualizado." : "Juego añadido.");
  });

  $("loanForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!isAdmin) return;

    const person = $("loanPerson").value.trim();
    const gameId = $("loanGame").value;
    const duration = Number($("loanDuration").value);
    const startDate = $("loanStart").value || todayISO();

    if (!person || !gameId) return;
    if (activeLoanForGame(gameId)) {
      showToast("Ese juego ya está prestado.");
      return;
    }

    const dueDate = addDays(startDate, duration);
    data.loans.push({
      id: createId("loan"),
      person,
      gameId,
      startDate,
      duration,
      dueDate,
      price: priceForDays(duration),
      returnedAt: null
    });

    saveData();
    closeModal("loanModal");
    $("loanForm").reset();
    renderAll();
    showToast(`Préstamo registrado hasta el ${formatDate(dueDate)}.`);
  });

  $("loanDuration").addEventListener("change", updateLoanPreview);
  $("loanStart").addEventListener("change", updateLoanPreview);

  $("gameSearch").addEventListener("input", renderGames);
  $("platformFilter").addEventListener("change", renderGames);
  $("availabilityFilter").addEventListener("change", renderGames);

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (target.matches("[data-close-modal]")) {
      closeModal(target.getAttribute("data-close-modal"));
      return;
    }

    if (target.matches("[data-edit-game]")) {
      openEditGame(target.getAttribute("data-edit-game"));
      return;
    }

    if (target.matches("[data-delete-game]")) {
      deleteGame(target.getAttribute("data-delete-game"));
      return;
    }

    if (target.matches("[data-return-loan]")) {
      markReturn(target.getAttribute("data-return-loan"));
      return;
    }

    if (target.matches("[data-delete-loan]")) {
      deleteLoan(target.getAttribute("data-delete-loan"));
      return;
    }

    if (target.classList.contains("modal-backdrop")) {
      const modal = target.closest(".modal");
      if (modal) closeModal(modal.id);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    document.querySelectorAll(".modal:not(.hidden)").forEach((modal) => closeModal(modal.id));
  });

  // Arranque
  $("loanStart").value = todayISO();
  updateSessionUI();
})();
