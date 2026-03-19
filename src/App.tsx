import { useState } from "react";
import "./index.css";
import type { Project } from "./models/Project";
import { ProjectStorageApi } from "./api/projectStorage";

type FormData = {
  nazwa: string;
  opis: string;
};

const initialFormData: FormData = {
  nazwa: "",
  opis: "",
};

function App() {
  const [projects, setProjects] = useState<Project[]>(() =>
    ProjectStorageApi.getAll()
  );
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nazwa = formData.nazwa.trim();
    const opis = formData.opis.trim();

    if (!nazwa || !opis) {
      alert("Uzupełnij nazwę i opis projektu.");
      return;
    }

    if (editingId) {
      ProjectStorageApi.update({
        id: editingId,
        nazwa,
        opis,
      });
    } else {
      ProjectStorageApi.create({
        nazwa,
        opis,
      });
    }

    setProjects(ProjectStorageApi.getAll());
    resetForm();
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setFormData({
      nazwa: project.nazwa,
      opis: project.opis,
    });
  };

  const handleDelete = (id: string) => {
    const confirmed = window.confirm("Na pewno usunąć projekt?");
    if (!confirmed) {
      return;
    }

    ProjectStorageApi.delete(id);
    setProjects(ProjectStorageApi.getAll());

    if (editingId === id) {
      resetForm();
    }
  };

  return (
    <div className="container">
      <h1>ManageMe - starter</h1>
      <p className="subtitle">LAB01: CRUD projektów w localStorage</p>

      <div className="layout">
        <section className="card">
          <h2>{editingId ? "Edytuj projekt" : "Dodaj projekt"}</h2>

          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="nazwa">Nazwa</label>
              <input
                id="nazwa"
                name="nazwa"
                type="text"
                value={formData.nazwa}
                onChange={handleChange}
                placeholder="Np. Aplikacja do zarządzania zadaniami"
              />
            </div>

            <div className="form-group">
              <label htmlFor="opis">Opis</label>
              <textarea
                id="opis"
                name="opis"
                value={formData.opis}
                onChange={handleChange}
                placeholder="Krótki opis projektu..."
                rows={5}
              />
            </div>

            <div className="actions">
              <button type="submit">
                {editingId ? "Zapisz zmiany" : "Dodaj projekt"}
              </button>

              {editingId && (
                <button type="button" className="secondary" onClick={resetForm}>
                  Anuluj edycję
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="card">
          <h2>Lista projektów</h2>

          {projects.length === 0 ? (
            <p>Brak projektów.</p>
          ) : (
            <div className="project-list">
              {projects.map((project) => (
                <article key={project.id} className="project-item">
                  <h3>{project.nazwa}</h3>
                  <p>{project.opis}</p>

                  <div className="project-actions">
                    <button onClick={() => handleEdit(project)}>Edytuj</button>
                    <button
                      className="danger"
                      onClick={() => handleDelete(project.id)}
                    >
                      Usuń
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;