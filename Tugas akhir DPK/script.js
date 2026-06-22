document.addEventListener("DOMContentLoaded", () => {
    const loginPage = document.getElementById("loginPage");
    const dashboardPage = document.getElementById("dashboardPage");
    const loginForm = document.getElementById("loginForm");
    const transactionForm = document.getElementById("transactionForm");
    
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const rememberMeCheckbox = document.getElementById("rememberMe");

    const typeSelect = document.getElementById("type");
    const descGroup = document.getElementById("descGroup");
    const descInput = document.getElementById("description");
    const dateInput = document.getElementById("date");

    const totalBalanceEl = document.getElementById("totalBalance");
    const summaryIncomeEl = document.getElementById("summaryIncome");
    const summaryExpenseEl = document.getElementById("summaryExpense");
    const tableBody = document.getElementById("transactionTableBody");
    const emptyMessage = document.getElementById("emptyMessage");
    const logoutBtn = document.getElementById("logoutBtn");

    let currentUser = null; 
    let transactions = [];
    let storageKey = "";

    if (localStorage.getItem("saved_username")) {
        usernameInput.value = localStorage.getItem("saved_username");
        passwordInput.value = localStorage.getItem("saved_password") || "";
        rememberMeCheckbox.checked = true;
    }

    typeSelect.addEventListener("change", () => {
        if (typeSelect.value === "expense") {
            descGroup.classList.remove("hidden");
            descInput.setAttribute("required", "required");
        } else {
            descGroup.classList.add("hidden");
            descInput.removeAttribute("required");
            descInput.value = "";
        }
    });

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const user = usernameInput.value.trim().toLowerCase();
        const pwd = passwordInput.value;

        if (!user || !pwd) return;

        const registeredPassword = localStorage.getItem(`user_pwd_${user}`);

        if (registeredPassword) {
            if (registeredPassword !== pwd) {
                alert("Password salah! Silakan coba lagi.");
                return;
            }
        } else {
            localStorage.setItem(`user_pwd_${user}`, pwd);
            alert(`Akun baru dengan nama "${user}" berhasil didaftarkan!`);
        }

        if (rememberMeCheckbox.checked) {
            localStorage.setItem("saved_username", usernameInput.value.trim());
            localStorage.setItem("saved_password", pwd);
        } else {
            localStorage.removeItem("saved_username");
            localStorage.removeItem("saved_password");
        }

        currentUser = user;
        loginPage.classList.add("hidden");
        dashboardPage.classList.remove("hidden");
        
        document.getElementById("userGreeting").innerText = usernameInput.value.trim();
        storageKey = `transactions_${currentUser}`;
        transactions = JSON.parse(localStorage.getItem(storageKey)) || [];

        dateInput.value = new Date().toISOString().split('T')[0];
        updateUI();
    });

    logoutBtn.addEventListener("click", () => {
        currentUser = null;
        loginPage.classList.remove("hidden");
        dashboardPage.classList.add("hidden");
        if (!rememberMeCheckbox.checked) {
            passwordInput.value = "";
        }
    });

    const formatRupiah = (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }).format(number);
    };

    const formatDateStr = (dateStr) => {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateStr).toLocaleDateString('id-ID', options);
    };

    const updateUI = (isNewItem = false) => {
        tableBody.innerHTML = "";
        let totalIncome = 0;
        let totalExpense = 0;

        if (transactions.length === 0) {
            emptyMessage.style.display = "block";
        } else {
            emptyMessage.style.display = "none";
            
            transactions.forEach((tx, index) => {
                if (tx.type === "income") {
                    totalIncome += tx.amount;
                } else {
                    totalExpense += tx.amount;
                }

                const tr = document.createElement("tr");
                if (isNewItem && index === transactions.length - 1) {
                    tr.className = "new-row";
                }

                tr.innerHTML = `
                    <td>${formatDateStr(tx.date)}</td>
                    <td>
                        <span class="type-badge ${tx.type}">
                            ${tx.type === "income" ? "Pemasukan" : "Pengeluaran"}
                        </span>
                    </td>
                    <td><strong>${formatRupiah(tx.amount)}</strong></td>
                    <td>${tx.desc ? tx.desc : "-"}</td>
                    <td>
                        <button class="btn-delete" data-index="${index}">🗑️</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        }

        const finalBalance = totalIncome - totalExpense;
        totalBalanceEl.innerText = formatRupiah(finalBalance);
        summaryIncomeEl.innerText = formatRupiah(totalIncome);
        summaryExpenseEl.innerText = formatRupiah(totalExpense);
    };

    transactionForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const amountInput = document.getElementById("amount");
        const date = dateInput.value;
        const amount = parseInt(amountInput.value);
        const type = typeSelect.value;
        const desc = type === "expense" ? descInput.value.trim() : "";

        if (date && amount > 0) {
            const newTx = { date, amount, type, desc };
            transactions.push(newTx);

            localStorage.setItem(storageKey, JSON.stringify(transactions));
            updateUI(true);

            amountInput.value = "";
            descInput.value = "";
            typeSelect.value = "income";
            descGroup.classList.add("hidden");
            descInput.removeAttribute("required");
        }
    });

    tableBody.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-delete") || e.target.parentElement.classList.contains("btn-delete")) {
            const button = e.target.classList.contains("btn-delete") ? e.target : e.target.parentElement;
            const index = button.getAttribute("data-index");
            
            transactions.splice(index, 1);
            localStorage.setItem(storageKey, JSON.stringify(transactions));
            updateUI();
        }
    });
});