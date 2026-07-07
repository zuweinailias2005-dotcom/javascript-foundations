const profileImage = document.getElementById("profile-image");
const name = document.getElementById("name");
const email = document.getElementById("email");
const city = document.getElementById("city");
const country = document.getElementById("country");
const button = document.getElementById("loadUser");
const loader = document.getElementById("loader");

async function loadUser() {
    try {
        loader.classList.remove("hidden");
        const response = await fetch("https://randomuser.me/api/");
        if (!response.ok) {
            throw new Error("Failed to fetch user.");
        }
        const data = await response.json();

    
        const user = data.results[0];

        profileImage.src = user.picture.large;
        profileImage.alt = `${user.name.first} ${user.name.last}`;

        name.textContent = `${user.name.first} ${user.name.last}`;

        email.textContent = `${user.email}`;

        city.textContent = `${user.location.city}`;

        country.textContent = `${user.location.country}`;
    }
    catch (error) {
        name.textContent = "Something went wrong!";
        email.textContent = "";
        city.textContent = "";
        country.textContent = "";

        console.error(error);
    }
    finally {
        loader.classList.add("hidden");
    }
}

loadUser();
button.addEventListener("click", loadUser);