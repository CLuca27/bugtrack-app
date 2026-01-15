import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProjects, createProject, getAvailableProjects, becomeTester } from "../api/projects";
import { getBugsByProject, assignBug, createBug } from "../api/bugs";
import { api } from "../api/client"; 
import "./Dashboard.css";

// --- DICTIONAR DE TRADUCERE (MAPPING) ---
// Cheia = ce vine din baza de date (tehnic)
// Valoarea = ce vede omul (vizual)
const STATUS_LABELS = {
  'open': 'Deschis',
  'in_progres': 'În curs de soluționare',
  'solved': 'Rezolvat',
  // Fallback pentru cazurile cu majuscule (just in case)
  'OPEN': 'Deschis',
  'IN_PROGRES': 'În curs de soluționare',
  'SOLVED': 'Rezolvat'
};

export default function Dashboard() {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [myProjects, setMyProjects] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modale
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false); 
  const [showBugModal, setShowBugModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showMarketplaceModal, setShowMarketplaceModal] = useState(false); 

  // Formulare
  const [newProject, setNewProject] = useState({ 
    name: "", 
    repositoryLink: "", 
    description: "" 
  });

  const [editProject, setEditProject] = useState({ 
    name: "", 
    repositoryLink: "", 
    description: "" 
  }); 
  
  const [newBug, setNewBug] = useState({ 
    description: "", 
    severity: "Low", 
    priority: "Low", 
    commitLink: "" 
  });

  const [resolution, setResolution] = useState({ 
    bugId: null, 
    commitLink: "" 
  });

  const [newMember, setNewMember] = useState({ 
    email: "", 
    role: "MP" 
  });

  // --- EFECTE ---

  useEffect(() => {
    const initApp = async () => {
      try {
        setLoading(true);
        const userRes = await api.get("/users/profile");
        setCurrentUser(userRes.data.user);
        await loadProjects();
      } catch (err) {
        if (err.response?.status === 401) {
            navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    initApp();
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    loadProjects(true);
    if (selectedProject) {
      loadBugs(selectedProject.id);
    }
  }, [refreshTrigger, selectedProject, currentUser]);

  // --- DATA FETCHING ---

  const loadProjects = async (silent = false) => {
    try {
      const [resMy, resAvail] = await Promise.all([
          getMyProjects(), 
          getAvailableProjects()
      ]);
      setMyProjects(resMy.data.projects);
      setAvailableProjects(resAvail.data.projects);
    } catch (err) {
      console.error("Eroare incarcare proiecte", err);
    }
  };

  const loadBugs = async (projectId) => {
    try {
      const res = await getBugsByProject(Number(projectId));
      setBugs(res.data.bugs);
    } catch (err) {
      console.error("Eroare incarcare bug-uri", err);
    }
  };

  const forceRefresh = () => {
      setRefreshTrigger(prev => prev + 1);
  };

  // --- UTILS PENTRU CSS STATUS ---
  const getStatusBadgeClass = (status) => {
      const s = status ? status.toLowerCase() : '';
      
      if (s === 'open') return 'badge-open';
      if (s === 'in_progres' || s === 'in_progress') return 'badge-progress';
      if (s === 'solved' || s === 'rezolvat') return 'badge-solved';
      
      return '';
  };

  // --- HANDLERS ---

 const handleLogout = async () => {
  try {
    // Trimitem cererea la ruta de logout pe care o ai deja în backend
    await api.post("/users/logout"); 
    // Acum că serverul a șters sesiunea, mergem la login
    navigate("/login");
  } catch (error) {
    console.error("Eroare la logout:", error);
    navigate("/login"); // Mergem oricum la login în caz de eroare
  }
};

  const handleSelectProject = (project) => {
    setBugs([]); 
    setSelectedProject(project);
    setEditProject({ 
        name: project.name, 
        repositoryLink: project.repositoryLink, 
        description: project.description 
    });
  };

  const handleAssignBug = async (bugId) => {
    // LOGICA TEHNICĂ: Verificăm 'in_progres' (indiferent de majuscule)
    const hasActive = bugs.some(b => 
        b.assignedToId === currentUser?.id && 
        b.status?.toLowerCase() === 'in_progres'
    );

    if (hasActive) {
      alert("Ai deja un bug în lucru! Finalizează-l pe acela înainte.");
      return;
    }
    try {
      await assignBug(bugId);
      forceRefresh();
    } catch (err) {
      alert(err.response?.data?.message || "Eroare la alocare");
    }
  };

  const handleFinalizeBug = async (e) => {
    e.preventDefault();
    try {
      // Trimitem statusul tehnic 'solved' și link-ul de rezolvare
      await api.put(`/bugs/${resolution.bugId}`, { 
          status: 'solved', 
          commitLink: resolution.commitLink 
      });
      setShowResolveModal(false);
      forceRefresh();
    } catch (err) { 
        alert("Eroare la finalizare"); 
    }
  };

  const handleReportBug = async (e) => {
    e.preventDefault();
    try {
      await createBug({ ...newBug, projectId: selectedProject.id });
      setShowBugModal(false);
      setNewBug({ 
          description: "", 
          severity: "Low", 
          priority: "Low", 
          commitLink: "" 
      });
      forceRefresh();
    } catch (err) { 
        alert("Eroare la raportare"); 
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await createProject(newProject);
      setShowProjectModal(false);
      setNewProject({ 
          name: "", 
          repositoryLink: "", 
          description: "" 
      });
      forceRefresh();
    } catch (err) { 
        alert("Eroare creare"); 
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${selectedProject.id}`, editProject);
      alert("Proiect actualizat!");
      setShowEditProjectModal(false);
      setSelectedProject(prev => ({...prev, ...editProject}));
      forceRefresh();
    } catch (err) { 
        alert("Eroare actualizare"); 
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${selectedProject.id}/add-member`, newMember);
      alert("Membru adăugat!");
      setShowMemberModal(false);
      setNewMember({ email: "", role: "MP" });
    } catch (err) { 
        alert("Eroare adăugare membru"); 
    }
  };

  const handleJoinAsTester = async (projectId) => {
    try {
      await becomeTester(projectId);
      alert("Te-ai înscris!");
      setShowMarketplaceModal(false);
      forceRefresh();
    } catch (err) { 
        alert("Eroare înscriere"); 
    }
  };

  const filteredProjects = availableProjects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Variabila UI pentru a dezactiva butonul (verifică 'in_progres')
  const userHasActiveBug = bugs.some(b => 
      b.assignedToId === currentUser?.id && 
      b.status?.toLowerCase() === 'in_progres'
  );

  if (loading) {
      return <div className="dashboard-page">Se încarcă aplicația...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        
        {/* --- SIDEBAR FIXAT CU SCROLL --- */}
        <aside className="project-sidebar">
          
          {/* Header */}
          <div className="sidebar-header">
            <div className="sidebar-brand">
              <img src="/logo.png" alt="BugTester Logo" className="brand-logo" />
            </div>

            <div className="user-profile-card">
              <div className="user-details-left">
                <div className="user-avatar">👤</div>
                <div className="user-info">
                  <span className="welcome-label">Salut,</span>
                  <span className="user-email">{currentUser?.email}</span>
                </div>
              </div>
              <button 
                className="btn-logout-icon" 
                onClick={handleLogout} 
                title="Deconectare"
              >
                  ⏻
              </button>
            </div>
          </div>

          {/* Listă Scrollabilă (zona de mijloc) */}
          <div className="sidebar-list-area">
            <div className="sidebar-section">
              <h3>Proiectele Mele</h3>
              <div className="project-items">
                {myProjects.map((p) => (
                  <div 
                    key={p.id} 
                    className={`project-card ${selectedProject?.id === p.id ? "active" : ""}`} 
                    onClick={() => handleSelectProject(p)}
                  >
                    <strong className="project-name-limit">{p.name}</strong>
                    <span className={`role-badge ${p.role}`}>{p.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Fix */}
          <div className="sidebar-footer">
            <button 
                className="btn-marketplace" 
                onClick={() => { setSearchTerm(""); setShowMarketplaceModal(true); }}
            >
              🔍 Devino Tester
            </button>
            <button 
                className="btn-create-project" 
                onClick={() => setShowProjectModal(true)}
            >
              + Proiect Nou
            </button>
          </div>

        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="bug-content">
          {selectedProject ? (
            <>
              <div className="project-detail-header">
                <div className="title-section">
                  <h2>{selectedProject.name}</h2>
                  <p className="project-desc">{selectedProject.description}</p>
                </div>
                <div className="meta-section">
                  <div className="meta-item">
                    <span className="meta-label">Repository:</span>
                    <a 
                        href={selectedProject.repositoryLink} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="repo-link-styled"
                    >
                      {selectedProject.repositoryLink}
                    </a>
                  </div>
                </div>
                <div className="actions-section">
                   {selectedProject.role === 'MP' && (
                     <div className="mp-actions-group">
                      <button 
                        className="btn-action-outline" 
                        onClick={() => setShowEditProjectModal(true)}
                      >
                          Editează Proiect
                      </button>
                      <button 
                        className="btn-action-solid" 
                        onClick={() => setShowMemberModal(true)}
                      >
                          Adaugă Membru
                      </button>
                     </div>
                   )}
                   {selectedProject.role === 'TST' && (
                     <button 
                        className="btn-action-primary" 
                        onClick={() => setShowBugModal(true)}
                     >
                        Raportează Bug
                     </button>
                   )}
                </div>
              </div>

              <div className="bug-list">
                <h3>Bug-uri Raportate</h3>
                <table className="bug-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Descriere / Link-uri</th>
                      <th>Severitate</th>
                      <th>Responsabil</th>
                      {selectedProject.role === 'MP' && <th>Acțiune</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {bugs.map((bug) => {
                      const responsibleEmail = bug.AssignedTo?.email || bug.User?.email;
                      const statusClass = getStatusBadgeClass(bug.status);
                      
                      // Luăm statusul normalizat pentru verificări logice
                      const currentStatus = bug.status?.toLowerCase();

                      return (
                        <tr key={bug.id}>
                          <td>
                            {/* AFISARE: Afisam textul frumos din STATUS_LABELS */}
                            <span className={`status-badge ${statusClass}`}>
                                {STATUS_LABELS[bug.status] || bug.status}
                            </span>
                          </td>
                          <td>
                            <div className="bug-desc-cell">
                              <strong className="bug-desc-text">{bug.description}</strong>
                              
                              {/* === AICI APAR CELE DOUA LINK-URI === */}
                              
                              {/* 1. Link Sursa (de la Tester) */}
                              {bug.commitLink && (
                                <div className="link-info-row source-link">
                                  Sursă bug: <a href={bug.commitLink} target="_blank" rel="noreferrer">Vezi Commit</a>
                                </div>
                              )}

                              {/* 2. Link Solutie (de la MP) */}
                              {bug.resolutionCommitLink && (
                                <div className="link-info-row fix-link">
                                  Soluție: <a href={bug.resolutionCommitLink} target="_blank" rel="noreferrer">Vezi Fix</a>
                                </div>
                              )}
                              
                              {/* ==================================== */}
                            </div>
                          </td>
                          <td>{bug.severity}</td>
                          <td>
                            {responsibleEmail ? (
                              <span className={`responsible-badge ${bug.assignedToId === currentUser?.id ? "me" : ""}`}>
                                {responsibleEmail}
                              </span>
                            ) : (
                              <span className="unassigned-badge">Nealocat</span>
                            )}
                          </td>
                          {selectedProject.role === 'MP' && (
                            <td>
                              <div className="action-cell">
                                
                                {/* LOGICA BUTOANE: Verificam statusul tehnic ('open') */}
                                {currentStatus === 'open' && (
                                  <button 
                                    className={`btn-assign-action ${userHasActiveBug ? "disabled" : ""}`} 
                                    onClick={() => handleAssignBug(bug.id)}
                                    disabled={userHasActiveBug}
                                  >
                                    Preluare
                                  </button>
                                )}

                                {/* LOGICA BUTOANE: Verificam statusul tehnic ('in_progres') */}
                                {currentStatus === 'in_progres' && bug.assignedToId === currentUser?.id && (
                                  <button 
                                    className="btn-resolve-action" 
                                    onClick={() => { setResolution({bugId: bug.id, commitLink: ""}); setShowResolveModal(true); }}
                                  >
                                    Rezolvă
                                  </button>
                                )}

                                {currentStatus === 'solved' && <span className="text-solved">✓ Finalizat</span>}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="welcome-placeholder">
              <div className="placeholder-content">
                <h2>Bun venit în BugTracker</h2>
                <p>Selectează un proiect din stânga pentru a începe.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* --- MODALE --- */}
      {showEditProjectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Editează Proiect</h2>
            <form onSubmit={handleUpdateProject}>
              <div className="form-group">
                <label>Nume:</label>
                <input type="text" required value={editProject.name} onChange={(e) => setEditProject({...editProject, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Repo URL:</label>
                <input type="url" required value={editProject.repositoryLink} onChange={(e) => setEditProject({...editProject, repositoryLink: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Descriere:</label>
                <textarea value={editProject.description} onChange={(e) => setEditProject({...editProject, description: e.target.value})} />
              </div>
              <div className="modal-footer-actions">
                <button type="submit" className="btn-save-form">Salvează</button>
                <button type="button" className="btn-cancel-form" onClick={() => setShowEditProjectModal(false)}>Anulează</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMarketplaceModal && (
        <div className="modal-overlay">
          <div className="modal-content marketplace-modal">
            <h2>Proiecte disponibile</h2>
            <div className="form-group search-group">
                <input type="text" placeholder="Caută..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus />
            </div>
            <div className="available-list">
                {filteredProjects.map((p) => (
                    <div key={p.id} className="available-item">
                        <div className="item-info">
                            <strong>{p.name}</strong>
                            <p>{p.description}</p>
                        </div>
                        <button className="btn-join" onClick={() => handleJoinAsTester(p.id)}>Devino Tester</button>
                    </div>
                ))}
            </div>
            <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowMarketplaceModal(false)}>Închide</button>
            </div>
          </div>
        </div>
      )}

      {showProjectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Creează Proiect Nou</h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Nume Proiect:</label>
                <input type="text" required value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Repository URL:</label>
                <input type="url" required value={newProject.repositoryLink} onChange={(e) => setNewProject({...newProject, repositoryLink: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Descriere Proiect:</label>
                <textarea value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} />
              </div>
              <div className="modal-footer-actions">
                <button type="submit" className="btn-save-form">Creează</button>
                <button type="button" className="btn-cancel-form" onClick={() => setShowProjectModal(false)}>Anulează</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Adaugă membru</h2>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label>Email:</label>
                <input type="email" required value={newMember.email} onChange={(e) => setNewMember({ email: e.target.value, role: "MP" })} />
              </div>
              <div className="modal-footer-actions">
                <button type="submit" className="btn-save-form">Adaugă</button>
                <button type="button" className="btn-cancel-form" onClick={() => setShowMemberModal(false)}>Închide</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResolveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Finalizare Rezolvare</h2>
            <form onSubmit={handleFinalizeBug}>
              <div className="form-group">
                <label>Link Commit Fix (Soluția):</label>
                <input 
                    type="text" 
                    required 
                    placeholder="Link-ul commit-ului care rezolvă bug-ul"
                    value={resolution.commitLink} 
                    onChange={(e) => setResolution({...resolution, commitLink: e.target.value})} 
                />
              </div>
              <div className="modal-footer-actions">
                <button type="submit" className="btn-save-form">Salvează</button>
                <button type="button" className="btn-cancel-form" onClick={() => setShowResolveModal(false)}>Închide</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showBugModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Raportează Bug</h2>
            <form onSubmit={handleReportBug}>
              <div className="form-group">
                <label>Descriere:</label>
                <textarea required value={newBug.description} onChange={(e) => setNewBug({...newBug, description: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Link Commit (Unde apare problema):</label>
                <input 
                    type="url" 
                    placeholder="https://github.com/..."
                    value={newBug.commitLink} 
                    onChange={(e) => setNewBug({...newBug, commitLink: e.target.value})} 
                />
              </div>
              <div className="form-group-row">
                <div className="form-group half">
                    <label>Severitate:</label>
                    <select value={newBug.severity} onChange={(e) => setNewBug({...newBug, severity: e.target.value})}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>
                <div className="form-group half">
                    <label>Prioritate:</label>
                    <select value={newBug.priority} onChange={(e) => setNewBug({...newBug, priority: e.target.value})}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>
              </div>
              <div className="modal-footer-actions">
                <button type="submit" className="btn-save-form">Trimite</button>
                <button type="button" className="btn-cancel-form" onClick={() => setShowBugModal(false)}>Închide</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
