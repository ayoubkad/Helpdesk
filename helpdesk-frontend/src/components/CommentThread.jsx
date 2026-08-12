import { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import api from "../services/api";
import "./CommentThread.css";
function CommentThread({ ticketId }) {
    const { userRole } = useAuth();
    const [comments, setComments] = useState([]); 
    const [content, setContent] = useState(""); 
    const [isInternal, setIsInternal] = useState(false);
    const [loading, setLoading] = useState(true); 
    const [sending, setSending] = useState(false); 
    const [error, setError] = useState("");
    const canCreateInternalNote = userRole === "TECHNICIEN" || userRole === "ADMIN";
    const getComments = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await api.get(
                `/api/tickets/${ticketId}/comments`
            );
            setComments(response.data);
        }catch (err) {
            console.error("Erreur lors du chargement des commentaires :", err);
            setError("Impossible de charger les commentaires.");
        }finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (ticketId) {
            getComments();
        }
    }, [ticketId]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) {
             setError("Veuillez écrire un commentaire.");
              return; 
            }
        const internalValue = canCreateInternalNote ? isInternal : false;
        try {
            setSending(true);
            setError("");
            const response = await api.post( 
                `/api/tickets/${ticketId}/comments`,
                {
                    content: content.trim(), isInternal: internalValue,
                } 
            );
            setComments((prevComments) => [
                ...prevComments, 
                response.data, 
            ]);
            setContent("");
            setIsInternal(false);
        }catch (err) { 
            console.error("Erreur lors de l'ajout du commentaire :", err); 
            setError("Impossible d'ajouter le commentaire.");
        }finally {
            setSending(false);
        }
    };
    return(
        <div className="comment-thread">
            {/* Titre */}
            <h2 className="comment-title">commentaires</h2>
            {/* Liste des commentaires */}
            <div className="comments-list">
                {loading && ( 
                    <p className="comment-message"> 
                    Chargement des commentaires...
                    </p>
                )}
                {!loading && comments.length === 0 && (
                    <p className="comment-message"> 
                     Aucun commentaire pour le moment.
                    </p> 
                )}
                {!loading && comments.map((comment) => (
                    <div className={`comment-card ${ comment.isInternal ? "internal-comment" : "" }`} key={comment.id} >
                        <div className="comment-header">
                            <strong>
                                {comment.author?.nom || comment.author?.username || comment.user?.nom || "Utilisateur"}
                            </strong>
                            {comment.isInternal && ( 
                                <span className="internal-badge"> 
                                🔒 Note interne 
                                </span> 
                            )}
                        </div>
                        <p className="comment-content"> 
                            {comment.content}
                        </p>
                        {comment.datePublication && ( 
                            <small className="comment-date">
                                {new Date( comment.datePublication ).toLocaleString()} 
                            </small>
                        )}
                    </div>
                ))}
                {/* Erreur */}
                {error && ( 
                    <p className="comment-error">
                        {error} 
                    </p> 
                )} 
                {/* Formulaire */}
                 <form className="comment-form" onSubmit={handleSubmit} >
                    <textarea className="comment-textarea"
                    placeholder="Écrire un commentaire..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={sending}
                    rows={4} />
                    {/* Checkbox uniquement pour Technicien/Admin */}
                    {canCreateInternalNote && (
                        <label className="internal-checkbox">
                            <input type="checkbox"
                            checked={isInternal}
                            onChange={(e) =>
                            setIsInternal(e.target.checked) }
                            disabled={sending}
                            />
                            <span>
                                Note interne 
                            </span>
                        </label> 
                    )}
                    <button type="submit" 
                    className="comment-submit" 
                    disabled={sending} >
                        {sending ? "Envoi..." : "Ajouter"}
                    </button>
                </form>   
            </div>
        </div>

    );
        
}
export default CommentThread;
