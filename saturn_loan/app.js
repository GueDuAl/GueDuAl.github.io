(() => {
  "use strict";

  const config = window.saturnLoanConfig || {};
  const missingConfig =
    !config.supabaseUrl ||
    !config.supabasePublishableKey ||
    config.supabaseUrl.includes("TU-PROYECTO") ||
    config.supabasePublishableKey.includes("TU-PUBLISHABLE-KEY");

  if (missingConfig) {
    document.addEventListener("DOMContentLoaded", () => {
      document.body.insertAdjacentHTML(
        "afterbegin",
        `<div style="position:fixed;top:0;left:0;right:0;z-index:9999;padding:14px 20px;background:#7f1d1d;color:white;font:600 13px/1.4 system-ui;text-align:center">
          Saturn Loan todavía no está conectado a Supabase. Completa <strong>config.js</strong> con los datos de tu proyecto.
        </div>`
      );
    });
    return;
  }

  const { createClient } = window.supabase;
  const supabase = createClient(config.supabaseUrl, config.supabasePublishableKey);

  const $ = (id) => document.getElementById(id);

  let games = [];
  let loans = [];
  let currentUser = null;
  let isAdmin = false;

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDate(dateString) {
    if (!dateString) return "";
    const [year, month, day] = String(dateString).split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  function toISODate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function todayISO() {
    return toISODate(new Date());
  }

  function dateFromISO(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function addDays(dateString, days) {
    const d = dateFromISO(dateString);
    d.setDate(d.getDate() + Number(days));
    return toISODate(d);
  }

  function priceForDays(days) {
    if (Number(days) <= 7) return 1;
    if (Number(days) <= 14) return 2;
    return 3;
  }

  function daysLate(dueDate) {
    const today = dateFromISO(todayISO());
    const due = dateFromISO(dueDate);
    return Math.max(0, Math.floor((today.getTime() - due.getTime()) / 86400000));
  }

  function activeLoanForGame(gameId) {
    return loans.find((loan) => loan.game_id === gameId && !loan.returned_at);
  }

  function updateSessionUI() {
    $("sessionBadge").textContent = isAdmin ? "Administrador" : "Invitado";
    $("sessionBadge").className = `session-badge ${isAdmin ? "admin" : "guest"}`;
    $("adminButton").textContent = isAdmin ? "Salir de administrador" : "Administrador";
    document.querySelectorAll(".admin-only").forEach((el) => {
      el.classList.toggle("hidden", !isAdmin);
    });
  }

  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function openModal(id) {
    $(id).classList.remove("hidden");
    const firstField = $(id).querySelector(
      "input:not([type=hidden]), select, textarea, button:not(.modal-close)"
    );
    if (firstField) setTimeout(() => firstField.focus(), 50);
  }

  function closeModal(id) {
    $(id).classList.add("hidden");
  }

  function renderStats() {
    const gameCount = games.length;
    const loanedCount = games.filter((game) => activeLoanForGame(game.id)).length;
    const availableCount = gameCount - loanedCount;
    const activeLoans = loans.filter((loan) => !loan.returned_at).length;

    $("statGames").textContent = gameCount;
    $("statAvailable").textContent = availableCount;
    $("statLoaned").textContent = loanedCount;
    $("statActiveLoans").textContent = activeLoans;
    $("heroAvailable").textContent =
      `${availableCount} ${availableCount === 1 ? "juego disponible" : "juegos disponibles"}`;
    $("heroLoans").textContent =
      `${activeLoans} ${activeLoans === 1 ? "préstamo activo" : "préstamos activos"}`;
  }

  function renderPlatformFilter() {
    const current = $("platformFilter").value;
    const platforms = [...new Set(
      games.map((game) => game.platform.trim()).filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));

    $("platformFilter").innerHTML =
      `<option value="all">Todas las plataformas</option>` +
      platforms.map((platform) =>
        `<option value="${escapeHTML(platform)}">${escapeHTML(platform)}</option>`
      ).join("");

    if (platforms.includes(current)) {
      $("platformFilter").value = current;
    }
  }

  function renderGames() {
    const search = $("gameSearch").value.trim().toLowerCase();
    const platform = $("platformFilter").value;
    const availability = $("availabilityFilter").value;

    const filtered = games.filter((game) => {
      const loan = activeLoanForGame(game.id);
      const available = !loan;
      const text = [game.title, game.platform, game.code].join(" ").toLowerCase();

      return (
        text.includes(search) &&
        (platform === "all" || game.platform === platform) &&
        (
          availability === "all" ||
          (availability === "available" && available) ||
          (availability === "loaned" && !available)
        )
      );
    });

    $("gameGrid").innerHTML = filtered.map((game) => {
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
          <div class="cover" style="--cover-a:${escapeHTML(game.cover_a || "#4f46e5")};--cover-b:${escapeHTML(game.cover_b || "#06b6d4")}">
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

    $("catalogEmpty").classList.toggle("hidden", filtered.length !== 0);
  }

  function renderLoans() {
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

    const sortedLoans = [...loans].sort((a, b) => {
      if (a.returned_at && !b.returned_at) return 1;
      if (!a.returned_at && b.returned_at) return -1;
      return b.start_date.localeCompare(a.start_date);
    });

    const rows = sortedLoans.map((loan) => {
      const game = games.find((gameItem) => gameItem.id === loan.game_id);
      const returned = Boolean(loan.returned_at);
      const lateDays = !returned ? daysLate(loan.due_date) : 0;
      const lateFee = Math.min(lateDays * 0.5, 5);

      let statusHTML = `<span class="ok">En plazo</span>`;
      if (returned) {
        statusHTML = `<span class="ok">Devuelto ${formatDate(loan.returned_at)}</span>`;
      } else if (lateDays > 0) {
        statusHTML = `<span class="overdue">${lateFee.toFixed(2).replace(".", ",")} € de recargo</span>`;
      }

      return `
        <tr>
          <td><span class="loan-person">${escapeHTML(loan.person)}</span></td>
          <td>${game ? escapeHTML(game.title) : "Juego eliminado"}</td>
          <td>${formatDate(loan.start_date)}</td>
          <td class="${lateDays > 0 ? "overdue" : returned ? "ok" : ""}">${formatDate(loan.due_date)}</td>
          <td>${statusHTML}</td>
          <td class="table-actions">
            ${
              returned
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
    const availableGames = games.filter((game) => !activeLoanForGame(game.id));

    $("loanGame").innerHTML = availableGames.length
      ? availableGames.map((game) =>
        `<option value="${game.id}">${escapeHTML(game.title)} · ${escapeHTML(game.platform)}</option>`
      ).join("")
      : `<option value="">No hay juegos disponibles</option>`;

    $("newLoanButton").disabled = availableGames.length === 0;
  }

  function updateLoanPreview() {
    const startDate = $("loanStart").value || todayISO();
    const duration = Number($("loanDuration").value);
    const dueDate = addDays(startDate, duration);
    const price = priceForDays(duration);

    $("loanPreview").innerHTML =
      `<strong>Resumen:</strong> ${duration} días · devolución el <strong>${formatDate(dueDate)}</strong> · precio recomendado <strong>${price.toFixed(2).replace(".", ",")} €</strong>.`;
  }

  function renderAll() {
    updateSessionUI();
    renderStats();
    renderPlatformFilter();
    renderGames();
    renderLoans();
  }

  async function loadGames() {
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      showToast("No se ha podido cargar el catálogo.");
      return;
    }

    games = data || [];
    renderAll();
  }

  async function loadLoans() {
    if (!isAdmin) {
      loans = [];
      renderStats();
      renderLoans();
      return;
    }

    const { data, error } = await supabase
      .from("loans")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      showToast("No se han podido cargar los préstamos.");
      return;
    }

    loans = data || [];
    renderAll();
  }

  async function loadAdminStatus(user) {
    if (!user) {
      currentUser = null;
      isAdmin = false;
      loans = [];
      renderAll();
      return;
    }

    currentUser = user;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error(error);
      isAdmin = false;
      showToast("No se ha podido comprobar el rol.");
    } else {
      isAdmin = profile?.role === "admin";
    }

    if (isAdmin) {
      await loadLoans();
      showToast("Sesión de administrador iniciada.");
    } else {
      loans = [];
      renderAll();
    }
  }

  async function handleLogin(event) {
    event.preventDefault();

    const email = $("adminEmail").value.trim();
    const password = $("adminPassword").value;

    if (!email || !password) return;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error(error);
      showToast("Correo o contraseña incorrectos.");
      return;
    }

    closeModal("adminModal");
    $("adminLoginForm").reset();
    await loadAdminStatus(data.user);
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
      showToast("No se pudo cerrar la sesión.");
      return;
    }

    showToast("Has salido del modo administrador.");
  }

  function openAddGame() {
    $("gameForm").reset();
    $("gameId").value = "";
    $("gameModalTitle").textContent = "Añadir juego";
    openModal("gameModal");
  }

  function openEditGame(id) {
    const game = games.find((item) => item.id === id);
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

  async function saveGame(event) {
    event.preventDefault();
    if (!isAdmin) return;

    const id = $("gameId").value;
    const title = $("gameTitle").value.trim();
    const platform = $("gamePlatform").value.trim();
    const code = $("gameCode").value.trim();
    const condition = $("gameCondition").value;
    const notes = $("gameNotes").value.trim();

    if (!title || !platform || !code) return;

    const payload = {
      title,
      platform,
      code,
      condition,
      notes
    };

    let result;

    if (id) {
      result = await supabase
        .from("games")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("games")
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      console.error(result.error);
      showToast(result.error.code === "23505"
        ? "Ese código interno ya existe."
        : "No se pudo guardar el juego.");
      return;
    }

    closeModal("gameModal");
    await loadGames();
    showToast(id ? "Juego actualizado." : "Juego añadido.");
  }

  async function deleteGame(id) {
    if (!isAdmin) return;

    const game = games.find((item) => item.id === id);
    if (!game) return;

    if (activeLoanForGame(id)) {
      showToast("No puedes eliminar un juego que está prestado.");
      return;
    }

    if (!confirm(`¿Eliminar "${game.title}" del catálogo?`)) return;

    const { error } = await supabase
      .from("games")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      showToast("No se pudo eliminar el juego.");
      return;
    }

    await loadGames();
    showToast("Juego eliminado.");
  }

  async function saveLoan(event) {
    event.preventDefault();
    if (!isAdmin) return;

    const person = $("loanPerson").value.trim();
    const gameId = $("loanGame").value;
    const durationDays = Number($("loanDuration").value);
    const startDate = $("loanStart").value || todayISO();

    if (!person || !gameId) return;

    if (activeLoanForGame(gameId)) {
      showToast("Ese juego ya está prestado.");
      return;
    }

    const dueDate = addDays(startDate, durationDays);

    const { error } = await supabase
      .from("loans")
      .insert({
        person,
        game_id: gameId,
        start_date: startDate,
        duration_days: durationDays,
        due_date: dueDate,
        price: priceForDays(durationDays),
        returned_at: null
      });

    if (error) {
      console.error(error);
      showToast("No se pudo registrar el préstamo.");
      return;
    }

    closeModal("loanModal");
    $("loanForm").reset();
    $("loanStart").value = todayISO();
    await Promise.all([loadGames(), loadLoans()]);
    showToast(`Préstamo registrado hasta el ${formatDate(dueDate)}.`);
  }

  async function markReturn(id) {
    if (!isAdmin) return;

    const { error } = await supabase
      .from("loans")
      .update({ returned_at: todayISO() })
      .eq("id", id);

    if (error) {
      console.error(error);
      showToast("No se pudo registrar la devolución.");
      return;
    }

    await Promise.all([loadGames(), loadLoans()]);
    showToast("Devolución registrada.");
  }

  async function deleteLoan(id) {
    if (!isAdmin) return;
    if (!confirm("¿Borrar este registro de préstamo?")) return;

    const { error } = await supabase
      .from("loans")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      showToast("No se pudo borrar el registro.");
      return;
    }

    await Promise.all([loadGames(), loadLoans()]);
    showToast("Registro eliminado.");
  }

  function subscribeToChanges() {
    supabase
      .channel("saturn-loan-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "games" },
        () => loadGames()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "loans" },
        async () => {
          await loadGames();
          if (isAdmin) await loadLoans();
        }
      )
      .subscribe();
  }

  $("adminButton").addEventListener("click", async () => {
    if (isAdmin) {
      await logout();
      return;
    }

    $("adminEmail").value = "";
    $("adminPassword").value = "";
    openModal("adminModal");
  });

  $("adminLoginForm").addEventListener("submit", handleLogin);
  $("addGameTopButton").addEventListener("click", openAddGame);

  $("newLoanButton").addEventListener("click", () => {
    refreshLoanOptions();

    if ($("newLoanButton").disabled) {
      showToast("No hay juegos disponibles.");
      return;
    }

    $("loanForm").reset();
    $("loanStart").value = todayISO();
    refreshLoanOptions();
    updateLoanPreview();
    openModal("loanModal");
  });

  $("gameForm").addEventListener("submit", saveGame);
  $("loanForm").addEventListener("submit", saveLoan);
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
    document.querySelectorAll(".modal:not(.hidden)").forEach((modal) => {
      closeModal(modal.id);
    });
  });

  // Inicio.
  (async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error(sessionError);
      }

      await loadAdminStatus(sessionData?.session?.user || null);
      await loadGames();
      subscribeToChanges();

      supabase.auth.onAuthStateChange(async (_event, session) => {
        await loadAdminStatus(session?.user || null);
        await loadGames();
      });
    } catch (error) {
      console.error(error);
      showToast("No se ha podido conectar con Saturn Loan.");
    }
  })();
})();
