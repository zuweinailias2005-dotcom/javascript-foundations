const usersContainer = document.getElementById("users-container");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");
const genderSelect = document.getElementById("gender");
const countrySelect = document.getElementById("country");
const loader = document.getElementById("loader");
const userCount = document.getElementById("userCount");

let users = [];
let filteredUsers = [];
let favourites = JSON.parse(localStorage.getItem("favourites")) || [];

async function fetchUsers() {

    loader.classList.remove("hidden");

    try {

        const response = await fetch("https://randomuser.me/api/?results=20");

        const data = await response.json();

        users = data.results;

        filteredUsers = [...users];
        applyFilters();
        populateCountries();

        console.log(users);

    } catch (error) {

        console.log("Error:", error);
    }
    loader.classList.add("hidden");

}

fetchUsers();

function displayUsers(usersList) {
    usersContainer.innerHTML = "";
    userCount.textContent = `${usersList.length} Users Found`;
    usersList.forEach(user => {
        const isFavourite = favourites.includes(user.login.uuid);
        const card = document.createElement("div");
        card.className = "user-card";
        card.innerHTML = `
            <i class="fa-solid fa-heart favorite ${isFavourite ? "active" : ""}"></i>
            <img src="${user.picture.large}" alt="${user.name.first}">
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
}

function applyFilters() {
    filteredUsers = [...users];
    const searchValue = searchInput.value.toLowerCase();
    if (searchValue !== "") {
        filteredUsers = filteredUsers.filter(user => {
            const fullName =
                `${user.name.first} ${user.name.last}`.toLowerCase();
            return fullName.includes(searchValue);
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
    if (sortSelect.value === "za") {
        filteredUsers.sort((a, b) =>
            b.name.first.localeCompare(a.name.first)
        );
    }
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
    const countries = [...new Set(users.map(user => user.location.country))];
    countries.sort();
    countries.forEach(country => {
        const option = document.createElement("option");
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    });
}

searchInput.addEventListener("input", applyFilters);

sortSelect.addEventListener("change", applyFilters);

genderSelect.addEventListener("change", applyFilters);

countrySelect.addEventListener("change", applyFilters);