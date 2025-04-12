document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const catId = parseInt(params.get("id"));
    const token = localStorage.getItem("userToken");

    if (!catId || !token || isNaN(catId)) {
        alert("Invalid cat or not logged in.");
        window.location.href = "second.html";
        return;
    }

    try {
       
        const res = await fetch("/api/cats", {
            headers: { "x-token": token }
        });

        if (!res.ok) {
            alert("Failed to load cats.");
            return;
        }

        const cats = await res.json();
        const cat = cats.find(c => c.id === catId);

        if (!cat) {
            alert("Cat not found.");
            return;
        }

        document.getElementById("catImage").src = `${cat.image}`;
        document.getElementById("catName").innerText = cat.name;
        document.getElementById("catDescription").innerText = cat.description;

        const commentsList = document.getElementById("commentsList");
        commentsList.innerHTML = '';
        cat.comments.forEach(comment => {
            const el = document.createElement("div");
            el.className = "bg-gray-100 p-2 rounded";
            
            const strong = document.createElement("strong");
            strong.innerText = comment.user + ":";

            const text = document.createElement("span");
            text.innerText = comment.text;

            el.appendChild(strong);
            el.appendChild(text);
            commentsList.appendChild(el);
        });

        document.getElementById("submitCommentBtn").addEventListener("click", async () => {
            const text = document.getElementById("commentText").value.trim();
            if (!text) return alert("Comment cannot be empty.");

            const res = await fetch(`/api/cats/${catId}/comment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-token": token
                },
                body: JSON.stringify({ text })
            });

            if (res.ok) {
                
                const updatedCats = await (await fetch("/api/cats", {
                    headers: { "x-token": token }
                })).json();

                const updatedCat = updatedCats.find(c => c.id === catId);
                const lastComment = updatedCat.comments[updatedCat.comments.length - 1];

                const el = document.createElement("div");
                el.className = "bg-gray-100 p-2 rounded";

                const strong = document.createElement("strong");
                strong.innerText = lastComment.user + ":";
    
                const text = document.createElement("span");
                text.innerText = lastComment.text;
    
                el.appendChild(strong);
                el.appendChild(text);

                commentsList.appendChild(el);
                document.getElementById("commentText").value = '';
            } else {
                alert("Failed to add comment.");
            }
        });

        document.getElementById("backBtn").addEventListener("click", () => {
            window.location.href = "second.html";
        });

    } catch (err) {
        console.error(err);
        alert("Error loading cat details.");
    }
});
