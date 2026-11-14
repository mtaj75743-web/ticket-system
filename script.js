
let users = JSON.parse(localStorage.getItem("users") || "[]");
let bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
let currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

const authModal = document.getElementById("authModal");
const authForm = document.getElementById("authForm");
let mode = "login";

function setMode(value) {
    mode = value;

    document.getElementById("authName").hidden = mode === "login";
    document.getElementById("authName").required = mode === "signup";

    document.getElementById("authTitle").textContent =
        mode === "login" ? "Welcome to Ticketly" : "Create Account";

    document.getElementById("authSubmit").textContent =
        mode === "login" ? "Sign In" : "Sign Up";

    document.getElementById("authMessage").textContent = "";
}

function updatePage() {
    const button = document.getElementById("authButton");

    button.textContent = currentUser ? "Logout" : "Sign In";

    document.getElementById("name").value = currentUser?.name || "";
    document.getElementById("email").value = currentUser?.email || "";

    showBookings();
}

document.getElementById("authButton").onclick = function() {
    if (currentUser) {
        currentUser = null;
        localStorage.removeItem("currentUser");
        updatePage();
    } else {
        setMode("login");
        authModal.classList.add("show");
    }
};

authForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("authName").value.trim();
    const email = document.getElementById("authEmail").value.trim().toLowerCase();
    const password = document.getElementById("authPassword").value;
    const msg = document.getElementById("authMessage");

    if (mode === "signup") {
        if (!name) {
            msg.textContent = "Enter your name.";
            return;
        }

        if (users.some(u => u.email === email)) {
            msg.textContent = "Email already registered. Please sign in.";
            return;
        }

        users.push({ name, email, password });
        localStorage.setItem("users", JSON.stringify(users));

        currentUser = { name, email };

    } else {
        const user = users.find(
            u => u.email === email && u.password === password
        );

        if (!user) {
            msg.textContent = "Wrong email or password.";
            return;
        }

        currentUser = { name: user.name, email: user.email };
    }

    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    authModal.classList.remove("show");
    authForm.reset();
    updatePage();
});

function chooseEvent(eventName) {
    document.getElementById("event").value = eventName;
    document.getElementById("booking").scrollIntoView({ behavior: "smooth" });

    if (!currentUser) {
        setMode("login");
        authModal.classList.add("show");
    }
}

document.getElementById("bookingForm").addEventListener("submit", function(e) {
    e.preventDefault();

    if (!currentUser) {
        document.getElementById("message").textContent =
            "Please sign in before booking.";

        setMode("login");
        authModal.classList.add("show");
        return;
    }

    const date = document.getElementById("date").value;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (new Date(date + "T00:00:00") < today) {
        document.getElementById("message").textContent =
            "Please select a future date.";
        return;
    }

    const booking = {
        id: "TK" + Date.now(),
        name: currentUser.name,
        email: currentUser.email,
        event: document.getElementById("event").value,
        date,
        quantity: document.getElementById("quantity").value
    };

    bookings.push(booking);
    localStorage.setItem("bookings", JSON.stringify(bookings));

    document.getElementById("message").textContent =
        "Booking successful!";

    this.reset();
    updatePage();
});

function showBookings() {
    const list = document.getElementById("bookingList");

    if (!currentUser) {
        list.innerHTML = "<p>Please sign in to view bookings.</p>";
        return;
    }

    const mine = bookings.filter(b => b.email === currentUser.email);

    if (mine.length === 0) {
        list.innerHTML = "<p>No bookings yet. Book your first event!</p>";
        return;
    }

    list.innerHTML = mine.map(b => `
        <div class="booking-item">
            <h3>${escapeHTML(b.event)}</h3>
            <p>Name: ${escapeHTML(b.name)}</p>
            <p>Date: ${escapeHTML(b.date)}</p>
            <p>Tickets: ${escapeHTML(b.quantity)}</p>
            <p>Booking ID: ${escapeHTML(b.id)}</p>
            <button onclick="cancelBooking('${b.id}')">Cancel Booking</button>
        </div>
    `).join("");
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

function cancelBooking(id) {
    if (!currentUser) return;

    if (confirm("Cancel this booking?")) {
        bookings = bookings.filter(b =>
            !(b.id === id && b.email === currentUser.email)
        );

        localStorage.setItem("bookings", JSON.stringify(bookings));
        showBookings();
    }
}

const dateInput = document.getElementById("date");
const today = new Date();
dateInput.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString().split("T")[0];

updatePage();

if (!currentUser) {
    setMode("login");
    authModal.classList.add("show");
}
