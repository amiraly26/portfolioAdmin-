(function () {
  const config = window.APP_CONFIG;

  if (!config || !window.supabase) {
    console.error("Supabase config or library is missing.");
    return;
  }

  const projectList = document.querySelector("[data-project-list]");
  const statusNode = document.querySelector("[data-project-status]");

  if (!projectList) {
    return;
  }

  const client = window.supabase.createClient(
    config.supabaseUrl,
    config.supabaseAnonKey
  );

  function setStatus(message, isError) {
    if (!statusNode) {
      return;
    }

    statusNode.textContent = message || "";
    statusNode.style.color = isError ? "#b42318" : "";
  }

  function normalizeTechStack(techStack) {
    if (Array.isArray(techStack)) {
      return techStack;
    }

    if (typeof techStack === "string" && techStack.trim()) {
      const trimmed = techStack.trim();

      if (trimmed.charAt(0) === "[" && trimmed.charAt(trimmed.length - 1) === "]") {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parsed.map(function (item) {
              return String(item).trim();
            });
          }
        } catch (error) {
          console.warn("Could not parse tech stack JSON string.", error);
        }
      }

      return techStack.split(",").map(function (item) {
        return item.replace(/[\[\]"]/g, "").trim();
      });
    }

    return [];
  }

  function createProjectCard(project) {
    const article = document.createElement("article");
    article.className = "glass-card project-card";

    const tech = normalizeTechStack(project.tech_stack);
    const techMarkup =
      '<div class="tech-list">' +
      tech
        .map(function (item) {
          return "<span>" + item + "</span>";
        })
        .join("") +
      "</div>";

    article.innerHTML =
      "<h3>" +
      project.title +
      "</h3>" +
      "<p>" +
      (project.description || "No description provided.") +
      "</p>" +
      techMarkup;

    return article;
  }

  async function loadProjects() {
    setStatus("Loading projects...", false);

    const response = await client
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (response.error) {
      console.error(response.error);
      setStatus("Unable to load projects right now.", true);
      return;
    }

    projectList.innerHTML = "";

    if (!response.data || !response.data.length) {
      setStatus("No projects found yet.", false);
      return;
    }

    response.data.forEach(function (project) {
      projectList.appendChild(createProjectCard(project));
    });

    setStatus("", false);
  }

  loadProjects();
})();
