document.addEventListener("DOMContentLoaded", function () {
    const ws = new WebSocket("ws://localhost:3000"); // Connect to WebSocket server

    // Function to update cache table dynamically
    function updateCacheTable(data) {
        const cacheBody = document.getElementById("cacheBody");
        cacheBody.innerHTML = ""; // Clear table before updating

        data.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.key}</td>
                <td>${item.value}</td>
                <td>
                    <form action="/delete" method="post" class="deleteForm">
                        <input type="hidden" name="key" value="${item.key}">
                        <button type="submit">❌ Delete</button>
                    </form>
                </td>
            `;
            cacheBody.appendChild(row);
        });
    }

    // Receive real-time cache updates from the server
    ws.onmessage = (event) => {
        const cacheData = JSON.parse(event.data);
        updateCacheTable(cacheData);
    };

    // Handle adding cache without reloading
    document.getElementById("addCacheForm").addEventListener("submit", function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        fetch("/set", {
            method: "POST",
            body: new URLSearchParams(formData)
        });
        this.reset();
    });

    // Handle clearing all cache without reloading
    document.getElementById("clearCacheForm").addEventListener("submit", function (e) {
        e.preventDefault();
        fetch("/clear", { method: "POST" });
    });

    // Handle deleting cache without reloading (Event delegation)
    document.addEventListener("submit", function (e) {
        if (e.target.classList.contains("deleteForm")) {
            e.preventDefault();
            fetch("/delete", {
                method: "POST",
                body: new URLSearchParams(new FormData(e.target))
            });
        }
    });
});
