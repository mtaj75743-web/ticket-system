
const USERS_KEY = "ticketlyUsers";
const SESSION_KEY = "ticketlyCurrentUser";
const BOOKINGS_KEY = "ticketlyBookings";

let users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
let bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
let currentUser = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");

const form = document.getElementById("bookingForm");
const list = document.getElementById("bookingList");
const message = document.getElementById("message");

const authModal = document.getElementById("authModal");
const authButton = document.getElementById("authButton");
const authForm = document.getElementById("authForm");
const authName = document.getElementById("authName");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authMessage = document.getElementById("authMessage");

let authMode = "login";

function saveUsers() {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveBookings() {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

function saveSession() {
    if (currentUser) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    } else {
        localStorage.removeItem(SESSION_KEY);
    }
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[c]);
}

// Authentication modal

function openAuth(mode = "login") {
    setAuthMode(mode);
    authModal.classList.add("show");
}

function closeAuthModal() {
    authModal.classList.remove("show");
    authForm.reset();
    authMessage.textContent = "";
}

function setAuthMode(mode) {
    authMode = mode;

    const signup = mode === "signup";

    document.getElementById("authTitle").textContent =
        signup ? "Create Your Account" : "Welcome to Ticketly";

    document.getElementById("authSubtitle").textContent =
        signup ? "Sign up to start booking." : "Sign in to continue.";

    authName.hidden = !signup;
    authName.required = signup;

    authPassword.autocomplete =
        signup ? "new-password" : "current-password";

    document.getElementById("authSubmit").textContent =
        signup ? "Create Account" : "Sign In";

    document.getElementById("showLogin").classList.toggle("active", !signup);
    document.getElementById("showSignup").classList.toggle("active", signup);

    authMessage.textContent = "";
}

document.getElementById("showLogin").addEventListener("click", () => {
    setAuthMode("login");
});

document.getElementById("showSignup").addEventListener("click", () => {
    setAuthMode("signup");
});

document.getElementById("closeAuth").addEventListener("click", closeAuthModal);

authButton.addEventListener("click", () => {
    if (currentUser) {
        if (confirm("Are you sure you want to logout?")) {
            currentUser = null;
            saveSession();
            updateAuthButton();
            showBookings();
            message.textContent = "You have logged out.";
            document.getElementById("name").value = "";
            document.getElementById("email").value = "";
        }
    } else {
        openAuth("login");
    }
});

// Sign Up and Sign In

authForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const email = authEmail.value.trim().toLowerCase();
    const password = authPassword.value;
    const name = authName.value.trim();

    if (password.length < 6) {
        authMessage.textContent = "Password must be at least 6 characters.";
        return;
    }

    if (authMode === "signup") {
        if (!name) {
            authMessage.textContent = "Please enter your name.";
            return;
        }

        if (users.some(user => user.email === email)) {
            authMessage.textContent = "Email already registered. Please sign in.";
            return;
        }

        users.push({ name, email, password });
        saveUsers();

        currentUser = { name, email };

    } else {
        const user = users.find(
            u => u.email === email && u.password === password
        );

        if (!user) {
            authMessage.textContent = "Incorrect email or password.";
            return;
        }

        currentUser = { name: user.name, email: user.email };
    }

    saveSession();
    updateAuthButton();
    showBookings();

    document.getElementById("name").value = currentUser.name;
    document.getElementById("email").value = currentUser.email;

    authMessage.textContent = "Success! Welcome to Ticketly.";

    setTimeout(closeAuthModal, 700);
});

// Navbar update

function updateAuthButton() {
    authButton.textContent = currentUser
        ? "Logout"
        : "Sign In / Sign Up";
}

// Display bookings

function showBookings() {
    if (!currentUser) {
        list.innerHTML = `
            <div class="empty">
                <h3>Please sign in first.</h3>
                <p>Sign in to view your bookings.</p>
            </div>
        `;
        return;
    }

    const userBookings = bookings.filter(
        b => b.userEmail === currentUser.email
    );

    if (userBookings.length === 0) {
        list.innerHTML = `
            <div class="empty">
                <h3>No bookings yet!</h3>
                <p>Create your first demo booking.</p>
            </div>
        `;
        return;
    }

    list.innerHTML = userBookings.map(b => `
        <div class="booking-item">
            <div>
                <h3>${escapeHTML(b.event)}</h3>
                <p>Name: ${escapeHTML(b.name)}</p>
                <p>Email: ${escapeHTML(b.email)}</p>
                <p>Date: ${escapeHTML(b.date)}</p>
                <p>Tickets: ${escapeHTML(b.quantity)}</p>
                <p>Booking ID: ${escapeHTML(b.id)}</p>
            </div>
            <button onclick="cancelBooking('${escapeHTML(b.id)}')">
                Cancel Booking
            </button>
        </div>
    `).join("");
}

// Booking submission

form.addEventListener("submit", function(e) {
    e.preventDefault();

    if (!currentUser) {
        message.textContent = "Please sign in before booking.";
        openAuth("login");
        return;
    }

    const selectedDate = document.getElementById("date").value;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (new Date(selectedDate + "T00:00:00") < today) {
        message.textContent = "Please select a future date.";
        return;
    }

    const booking = {
        id: "TK" + Date.now(),
        name: currentUser.name,
        email: currentUser.email,
        userEmail: currentUser.email,
        event: document.getElementById("event").value,
        date: selectedDate,
        quantity: document.getElementById("quantity").value
    };

    bookings.push(booking);
    saveBookings();
    showBookings();

    message.textContent = "Demo booking created successfully!";

    form.reset();

    document.getElementById("name").value = currentUser.name;
    document.getElementById("email").value = currentUser.email;

    document.getElementById("dashboard").scrollIntoView({
        behavior: "smooth"
    });
});

// Cancel booking

function cancelBooking(id) {
    const index = bookings.findIndex(b =>
        b.id === id &&
        currentUser &&
        b.userEmail === currentUser.email
    );

    if (index === -1) return;

    if (confirm("Are you sure you want to cancel this booking?")) {
        bookings.splice(index, 1);
        saveBookings();
        showBookings();
    }
}

// Event card buttons

document.querySelectorAll(".event-btn").forEach(button => {
    button.addEventListener("click", () => {
        document.getElementById("event").value = button.dataset.event;

        document.getElementById("booking").scrollIntoView({
            behavior: "smooth"
        });

        if (!currentUser) {
            message.textContent = "Please sign in before booking.";
            openAuth("login");
        }
    });
});

// Minimum date = today

const dateInput = document.getElementById("date");
const today = new Date();
const offset = today.getTimezoneOffset();

dateInput.min = new Date(today.getTime() - offset * 60000)
    .toISOString()
    .split("T")[0];

// Initial setup

if (currentUser) {
    document.getElementById("name").value = currentUser.name;
    document.getElementById("email").value = currentUser.email;
}

updateAuthButton();
showBookings();

// Show login screen to new visitors
if (!currentUser) {
    openAuth("login");
}
