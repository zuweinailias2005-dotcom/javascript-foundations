const usersContainer = document.getElementById("users-container");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");
const genderSelect = document.getElementById("gender");
const countrySelect = document.getElementById("country");
const loader = document.getElementById("loader");
const userCount = document.getElementById("userCount");
const refreshBtn = document.getElementById("refresh-btn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageInfo = document.getElementById("pageInfo");
const clearSearchBtn = document.getElementById("clear-search");

let users = [];
let filteredUsers = [];
let favourites = JSON.parse(localStorage.getItem("favourites")) || [];
let currentPage = 1;
const usersPerPage = 6;
let searchTimeout;

async function fetchUsers() {

    loader.classList.remove("hidden");
    usersContainer.classList.add("hidden");
    loader.innerHTML = "";

    for (let i = 0; i < 6; i++) {
        loader.innerHTML += `
            <div class="skeleton-card">
                <div class="skeleton-image"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-line medium"></div>
                <div class="skeleton-line long"></div>
                <div class="skeleton-line medium"></div>
            </div>
        `;
    }

    try {

        const response = await fetch("https://randomuser.me/api/?results=20");
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (!response.ok) {
            throw new Error("Failed to fetch users");
        }

        const data = await response.json();

        users = data.results;

        filteredUsers = [...users];
        populateCountries();
        applyFilters();

    } catch (error) {

        console.error("Error:", error);

    } finally {
        loader.classList.add("hidden");
        usersContainer.classList.remove("hidden");

    }
}

fetchUsers();


function displayUsers(usersList) {
    usersContainer.innerHTML = "";
    if (usersList.length === 0) {
        userCount.textContent = "0 Users Found";
        usersContainer.innerHTML = `
            <div class="no-users">
                <h2>No users found</h2>
                <p>Try changing your search or filters.</p>
            </div>
        `;
        return;
    }
    userCount.textContent = `${usersList.length} Users Found`;

    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const paginatedUsers = usersList.slice(startIndex, endIndex);
    paginatedUsers.forEach(user => {
        const isFavourite = favourites.includes(user.login.uuid);
        const card = document.createElement("div");
        card.className = "user-card";
        card.innerHTML = `
            <i class="fa-solid fa-heart favorite ${isFavourite ? "active" : ""}" role="button" tabindex="0" aria-label="Toggle favourite"></i>
            <img src="${user.picture.large}" alt="${user.name.first}" loading="lazy">
            <h2>${user.name.first} ${user.name.last}</h2>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>City:</strong> ${user.location.city}</p>
            <p><strong>Country:</strong> ${user.location.country}</p>
        `;
        const heart = card.querySelector(".favorite");
        heart.addEventListener("click", () => {
            toggleFavourite(user.login.uuid);
        });
        usersContainer.appendChild(card);
    });
    updatePagination(usersList.length);
}

function updatePagination(totalUsers) {
    const totalPages = Math.ceil(totalUsers / usersPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

function applyFilters() {
    filteredUsers = [...users];
    const searchValue = searchInput.value.trim().toLowerCase();
    if (searchValue !== "") {
        filteredUsers = filteredUsers.filter(user => {
            const fullName =
                `${user.name.first} ${user.name.last}`.toLowerCase();
            const email = user.email.toLowerCase();
            const city = user.location.city.toLowerCase();
            const country = user.location.country.toLowerCase();
            return (
                fullName.includes(searchValue) ||
                email.includes(searchValue) ||
                city.includes(searchValue) ||
                country.includes(searchValue)
            );
        });
    }
    if (genderSelect.value !== "all") {
        filteredUsers = filteredUsers.filter(user =>
            user.gender === genderSelect.value
        );
    }
    if (countrySelect.value !== "all") {
        filteredUsers = filteredUsers.filter(user =>
            user.location.country === countrySelect.value
        );
    }
    if (sortSelect.value === "az") {
        filteredUsers.sort((a, b) =>
            a.name.first.localeCompare(b.name.first)
        );
    }
    else if (sortSelect.value === "za") {
        filteredUsers.sort((a, b) =>
            b.name.first.localeCompare(a.name.first)
        );
    }
    currentPage = 1;
    displayUsers(filteredUsers);
}

function toggleFavourite(id) {
    if (favourites.includes(id)) {
        favourites = favourites.filter(item => item !== id);
    } else {
        favourites.push(id);
    }
    localStorage.setItem("favourites", JSON.stringify(favourites));
    displayUsers(filteredUsers);
}

function populateCountries() {
    countrySelect.innerHTML = '<option value="all">All Countries</option>';
    const countries = [...new Set(users.map(user => user.location.country))];
    countries.sort();
    countries.forEach(country => {
        const option = document.createElement("option");
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    });
}

function refreshUsers() {
    searchInput.value = "";
    sortSelect.value = "default";
    genderSelect.value = "all";
    countrySelect.value = "all";
    fetchUsers();

}

searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        applyFilters();
    }, 300);
});

sortSelect.addEventListener("change", applyFilters);

genderSelect.addEventListener("change", applyFilters);

countrySelect.addEventListener("change", applyFilters);

refreshBtn.addEventListener("click", refreshUsers);

prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        displayUsers(filteredUsers);
    }
});

nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayUsers(filteredUsers);
    }
});

clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    applyFilters();
});