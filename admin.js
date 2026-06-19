(function () {
  const config = window.APP_CONFIG;

  if (!config || !window.authClient || !window.authHelpers) {
    console.error("Admin dependencies are missing.");
    return;
  }

  const client = window.authClient;
  const helpers = window.authHelpers;
  const loginForm = document.querySelector("[data-admin-login-form]");
  const loginStatus = document.querySelector("[data-login-status]");
  const dashboardRoot = document.querySelector("[data-admin-dashboard]");
  const projectForm = document.querySelector("[data-project-form]");
  const projectList = document.querySelector("[data-admin-project-list]");
  const projectStatus = document.querySelector("[data-project-status]");
  const logoutButton = document.querySelector("[data-logout]");
  const resetButton = document.querySelector("[data-reset-project-form]");
  const formTitle = document.querySelector("[data-form-title]");
  const hiddenId = document.querySelector('input[name="id"]');

  function setMessage(node, message, isError) {
    if (!node) {
      return;
    }

    node.textContent = message || "";
    node.style.color = isError ? "#b42318" : "#0f5132";
  }

  function parseTechStack(value) {
    return value
      .split(",")
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean)
      .join(", ");
  }

  function setFormMode(isEdit) {
    if (formTitle) {
      formTitle.textContent = isEdit ? "Edit Project" : "Add Project";
    }

    if (resetButton) {
      resetButton.hidden = !isEdit;
    }
  }

  function resetForm() {
    if (!projectForm) {
      return;
    }

    projectForm.reset();
    if (hiddenId) {
      hiddenId.value = "";
    }
    setFormMode(false);
    setMessage(projectStatus, "", false);
  }

  function fillForm(project) {
    if (!projectForm) {
      return;
    }

    hiddenId.value = project.id;
    projectForm.elements.title.value = project.title || "";
    projectForm.elements.description.value = project.description || "";
    projectForm.elements.tech_stack.value = Array.isArray(project.tech_stack)
      ? project.tech_stack.join(", ")
      : project.tech_stack || "";
    setFormMode(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function createRow(project) {
    const article = document.createElement("article");
    article.className = "admin-project-card";
    const techStack = Array.isArray(project.tech_stack)
      ? project.tech_stack
      : String(project.tech_stack || "")
          .split(",")
          .map(function (item) {
            return item.trim();
          })
          .filter(Boolean);

    const techMarkup = techStack.length
      ? '<div class="admin-project-card__tags">' +
        techStack
          .map(function (item) {
            return "<span>" + item + "</span>";
          })
          .join("") +
        "</div>"
      : "";

    article.innerHTML =
      '<div class="admin-project-card__content">' +
      "<h3>" +
      project.title +
      "</h3>" +
      "<p>" +
      (project.description || "No description provided.") +
      "</p>" +
      techMarkup +
      "</div>" +
      '<div class="admin-project-card__actions">' +
      '<button type="button" data-action="edit">Edit</button>' +
      '<button type="button" data-action="delete" class="danger">Delete</button>' +
      "</div>";

    article
      .querySelector('[data-action="edit"]')
      .addEventListener("click", function () {
        fillForm(project);
      });

    article
      .querySelector('[data-action="delete"]')
      .addEventListener("click", function () {
        deleteProject(project.id, project.title);
      });

    return article;
  }

  async function loadProjects() {
    if (!projectList) {
      return;
    }

    setMessage(projectStatus, "Loading projects...", false);

    const response = await client
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (response.error) {
      console.error(response.error);
      setMessage(projectStatus, "Could not load projects.", true);
      return;
    }

    projectList.innerHTML = "";

    response.data.forEach(function (project) {
      projectList.appendChild(createRow(project));
    });

    setMessage(projectStatus, "", false);
  }

  async function saveProject(event) {
    event.preventDefault();

    const formData = new FormData(projectForm);
    const payload = {
      title: formData.get("title").trim(),
      description: formData.get("description").trim(),
      tech_stack: parseTechStack(formData.get("tech_stack") || "")
    };

    if (!payload.title) {
      setMessage(projectStatus, "Project title is required.", true);
      return;
    }

    setMessage(projectStatus, "Saving project...", false);

    const id = formData.get("id");
    const query = id
      ? client.from("projects").update(payload).eq("id", id).select()
      : client.from("projects").insert([payload]).select();

    const response = await query;

    if (response.error) {
      console.error(response.error);
      setMessage(
        projectStatus,
        response.error.message || "Project could not be saved.",
        true
      );
      return;
    }

    setMessage(
      projectStatus,
      id ? "Project updated successfully." : "Project added successfully.",
      false
    );
    resetForm();
    loadProjects();
  }

  async function deleteProject(id, title) {
    const confirmed = window.confirm(
      'Delete "' + title + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    const response = await client.from("projects").delete().eq("id", id);

    if (response.error) {
      console.error(response.error);
      setMessage(projectStatus, "Project could not be deleted.", true);
      return;
    }

    setMessage(projectStatus, "Project deleted successfully.", false);
    if (hiddenId && hiddenId.value === id) {
      resetForm();
    }
    loadProjects();
  }

  async function initLoginPage() {
    await helpers.redirectIfLoggedIn();

    if (!loginForm) {
      return;
    }

    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const email = loginForm.elements.email.value.trim();
      const password = loginForm.elements.password.value;

      setMessage(loginStatus, "Signing in...", false);

      const response = await helpers.loginWithPassword(email, password);

      if (response.error) {
        console.error(response.error);
        setMessage(loginStatus, response.error.message, true);
        return;
      }

      setMessage(loginStatus, "Login successful. Redirecting...", false);
      window.location.href = "dashboard.html";
    });
  }

  async function initDashboardPage() {
    if (!dashboardRoot) {
      return;
    }

    await helpers.requireAuth();

    if (logoutButton) {
      logoutButton.addEventListener("click", function () {
        helpers.logout();
      });
    }

    if (projectForm) {
      projectForm.addEventListener("submit", saveProject);
    }

    if (resetButton) {
      resetButton.addEventListener("click", resetForm);
    }

    setFormMode(false);
    loadProjects();
  }

  initLoginPage();
  initDashboardPage();
})();
