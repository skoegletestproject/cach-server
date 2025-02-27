document.addEventListener("DOMContentLoaded", () => {
    fetchCache();
});

let cacheData = [];
let currentPage = 1;
const pageSize = 20;

async function fetchCache() {
    const response = await fetch("/get");
    cacheData = await response.json();
    updateTable();
}

function updateTable() {
    const tableBody = document.getElementById("cacheTable");
    tableBody.innerHTML = "";

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const paginatedData = cacheData.slice(start, end);

    paginatedData.forEach(({ key, value }) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${key}</td>
            <td>${value}</td>
            <td><button onclick="deleteCache('${key}')">❌ Delete</button></td>
        `;

        tableBody.appendChild(row);
    });

    document.getElementById("pageInfo").textContent = `Page ${currentPage}`;
    document.getElementById("prevPage").disabled = currentPage === 1;
    document.getElementById("nextPage").disabled = end >= cacheData.length;
}

document.getElementById("cacheForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const key = document.getElementById("key").value;
    const value = document.getElementById("value").value;

    await fetch("/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value })
    });

    fetchCache();
});

async function deleteCache(key) {
    await fetch("/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key })
    });

    fetchCache();
}

async function clearCache() {
    await fetch("/clear", { method: "POST" });
    fetchCache();
}

function changePage(step) {
    currentPage += step;
    updateTable();
}
