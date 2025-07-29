import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
    const fetchTicket = async () => {
      const token = localStorage.getItem("token");
      console.log("Fetching A ticket TOKEN, token:", token);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/tickets/get-ticket/${id}`,
          {
              headers: {Authorization: `Bearer ${token}`},
              method: "GET",
          }
        );
        console.log("Fetch tick status:", res.status);
        const data = await res.json();
        console.log(data);
        if (res.ok) {
          setTicket(data.ticket);
        } else {
          alert(data.message || "Failed to fetch ticket");
        }
      } catch (err) {
        console.error(err);
        alert("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    
   useEffect(() => {
    fetchTicket();
  }, [id]);

  if (loading)
    return <div className="text-center mt-10">Loading ticket details...</div>;
  if (!ticket) return <div className="text-center mt-10">Ticket not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-extrabold text-primary">Ticket Details</h2>
        <button className="btn btn-outline btn-secondary" onClick={() => window.history.back()}>
          ← Back
        </button>
      </div>
      <div className="card bg-base-100 shadow-lg p-6 space-y-4">
        <h3 className="text-2xl font-bold text-primary-content mb-2">{ticket.title}</h3>
        <p className="text-lg text-gray-700 mb-4">{ticket.description}</p>
        {ticket.status && (
          <>
            <div className="divider">Metadata</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p><strong>Status:</strong> {ticket.status}</p>
              {ticket.priority && <p><strong>Priority:</strong> {ticket.priority}</p>}
              {ticket.relatedSkills?.length > 0 && (
                <p><strong>Related Skills:</strong> {ticket.relatedSkills.join(", ")}</p>
              )}
              {ticket.assignedTo && (
                <p><strong>Assigned To:</strong> {ticket.assignedTo?.email}</p>
              )}
              {ticket.createdBy && (
                <p><strong>Created By:</strong> {ticket.createdBy?.email}</p>
              )}
              {ticket.createdAt && (
                <p className="text-sm text-gray-500 mt-2"><strong>Created At:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
              )}
            </div>
            {ticket.helpfulNotes && (
              <div className="mt-4">
                <strong>Helpful Notes:</strong>
                <div className="prose max-w-none rounded mt-2">
                  <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}