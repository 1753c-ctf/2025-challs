const modal = document.getElementById("authSection");
const modalContainer = document.getElementById("modalContainer");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const errorMsg = document.getElementById("errorMsg");

openModalBtn.addEventListener("click", function () {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
});
closeModalBtn.addEventListener("click", function () {
    modal.classList.add("hidden");
});
modal.addEventListener("click", function (event) {
    if (!modalContainer.contains(event.target)) {
        modal.classList.add("hidden");
    }
});

function storeUserData(user) {
    localStorage.setItem("userToken", user.token);
}

function redirectToDashboard() {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
        window.location.href = `second.html`;
    } else {
        alert("No token found. Please log in again.");
    }
}

// Register
registerBtn.addEventListener("click", async function () {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        showError("Please enter both username and password!");
        return;
    }

    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password,
                role: "user"
            })
        });

        const data = await response.json();

        if (response.ok) {
            storeUserData(data);
            redirectToDashboard();
        } else {
            showError(data || "Registration failed!");
        }
    } catch (error) {
        showError("Server error! Please try again later.");
    }
});

// Login
loginBtn.addEventListener("click", async function () {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        showError("Please enter both username and password!");
        return;
    }

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            storeUserData(data);
            redirectToDashboard();
        } else {
            showError("Invalid credentials!");
        }
    } catch (error) {
        showError("Server error! Please try again later.");
    }
});

function showError(msg) {
    errorMsg.innerText = msg;
    errorMsg.classList.remove("hidden");
}

// When second.html loads
document.addEventListener("DOMContentLoaded", function () {
    if (window.location.pathname.includes("second.html")) {
        const token = localStorage.getItem("userToken");
        console.log("Loaded token:", token);

        if (!token) {
            alert("No token found. Please log in again.");
            window.location.href = "index.html";
            return;
        }

        fetchWelcomeMessage(token);
    }
});

async function fetchWelcomeMessage(token) {
    try {
        const response = await fetch("/api/message", {
            method: "GET",
            headers: {
                "x-token": token
            }
        });

        const data = await response.json();

        if (response.ok) {
            const welcomeMessageDiv = document.getElementById("welcomeMessage");
            if (welcomeMessageDiv) {
                welcomeMessageDiv.innerText = data.message;
            }
        } else {
            alert("Failed to fetch welcome message.");
        }
    } catch (error) {
        console.error("Error fetching message:", error);
        alert("Error fetching message.");
    }
}
