document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("loginButton");
    const logoutButton = document.getElementById("logoutButton");
    const loginForm = document.getElementById("loginForm");
    const vozidloTable = document.getElementById("seznamVozidel");
    const formVozidlo = document.getElementById("formVozidlo");
    const pridatVozidloButton = document.getElementById("pridatVozidlo");
    const formularJizdy = document.getElementById("formularJizdy");
    const formularDotankovani = document.getElementById("formularDotankovani");
    const vehiclesContainer = document.getElementById("vehiclesContainer");

    vozidloTable.style.display = "none";
    formVozidlo.style.display = "none";
    formularJizdy.style.display = "none";
    formularDotankovani.style.display = "none";
    logoutButton.style.display = "none";

    // Přihlášení uživatele
    loginButton.addEventListener("click", () => {
        const passwordInput = document.getElementById("password").value;
        if (passwordInput === "hasici123") {
            localStorage.setItem("isAdmin", "true");
            updateUI();
        } else {
            alert("Nesprávné heslo!");
        }
    });

    // Nastavení výchozího stavu formuláře na zavřený
    const element = document.getElementById("formVozidlo");
    const toggleIcon = document.getElementById("toggleIcon");
    element.style.display = "none";
    toggleIcon.textContent = "▼ Otevřít";

    // Odhlášení uživatele
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("isAdmin");
        updateUI();
    });

    // Aktualizace UI na základě přihlášení
    function updateUI() {
        const isAdmin = localStorage.getItem("isAdmin") === "true";
        formVozidlo.style.display = isAdmin ? "block" : "none";
        vozidloTable.style.display = isAdmin ? "block" : "none";
        loginForm.style.display = isAdmin ? "none" : "block";
        logoutButton.style.display = isAdmin ? "block" : "none";
        vehiclesContainer.style.display = isAdmin ? "block" : "none"; // Skryje karty vozidel po odhlášení
        document.getElementById("addVehicleSection").style.display = isAdmin ? "block" : "none"; // Skryje sekci pro přidání vozidla
    
        // Skryje všechny formuláře a tabulky při odhlášení
        if (!isAdmin) {
            formVozidlo.style.display = "none";
            formularJizdy.style.display = "none";
            formularDotankovani.style.display = "none";
            document.getElementById("formularServis").style.display = "none";
            document.getElementById("formularSTK").style.display = "none";
            document.getElementById("formVozidlo").style.display = "none"; // Přidáno pro skrytí formuláře "Přidat nové vozidlo"
            document.getElementById("toggleIcon").style.display = "none"; // Skryje ikonu pro rozbalení
        } else {
            document.getElementById("toggleIcon").style.display = "inline"; // Zobrazí ikonu pro rozbalení při přihlášení
            document.getElementById("formVozidlo").style.display = "none"; // Zavře formulář při přihlášení
            document.getElementById("toggleIcon").textContent = "▼"; // Nastaví ikonu na zavřený stav
        }
    
        displayVehicles();
    }

    // Zobrazení seznamu vozidel v kartách
    function displayVehicles() {
        const vehicles = JSON.parse(localStorage.getItem("vehicles")) || [];
        vehiclesContainer.innerHTML = "";
    
        vehicles.forEach((vehicle, index) => {
            const vehicleCard = document.createElement("div");
            vehicleCard.classList.add("vehicle-card");
    
            vehicleCard.innerHTML = `
                <div class="vehicle-card-header">
                    <button class="delete-vehicle-button" onclick="confirmDeleteVehicle(${index})">
                        <span class="icon">⚠️</span>  
                    </button>
                </div>
                <h3><span class="vehicle-icon">🚗</span> ${vehicle.name}</h3>
                <p><strong>Tachometr:</strong> ${vehicle.odometer} km</p>
                <p><strong>Platnost STK:</strong> ${vehicle.stkValidity ? vehicle.stkValidity : 'Není zadaná'}</p>
                <p><strong>Datum posledního servisu:</strong> ${vehicle.serviceDate ? vehicle.serviceDate : 'Není zadané'}</p>
                <button onclick="addTrip(${index})"><span class="trip-icon">🛣️</span> Přidat jízdu</button>
                <button onclick="showRefuelForm(${index})"><span class="fuel-icon">⛽</span> Dotankování</button>
                <button onclick="showSTKForm(${index})"><span class="stk-icon">🔧</span> STK</button>
                <button onclick="showServiceForm(${index})"><span class="service-icon">🛠️</span> Servis</button>
                <div class="trips-container">${createTripsTable(vehicle.trips, vehicle.name)}</div>
            `;
    
            vehiclesContainer.appendChild(vehicleCard);
        });
    }

    // Funkce pro sbalení a rozbalení formuláře "Přidat nové vozidlo"
    window.toggleVisibility = function(elementId) {
        const element = document.getElementById(elementId);
        const toggleIcon = document.getElementById("toggleIcon");

        if (element.style.display === "none" || element.style.display === "") {
            element.style.display = "block";
            element.style.width = "50%"; // Nastavení šířky na polovinu
            toggleIcon.textContent = "▲ Zavřít"; // Změní ikonu na šipku nahoru
        } else {
            element.style.display = "none";
            toggleIcon.textContent = "▼ Otevřít"; // Změní ikonu na šipku dolů
        }
    }

    // Přidání nového vozidla
    pridatVozidloButton.addEventListener("click", () => {
        const vehicleName = document.getElementById("nazevVozidla").value;
        const initialOdometer = document.getElementById("pocatecniTachometr").value;

        if (vehicleName && initialOdometer) {
            const vehicles = JSON.parse(localStorage.getItem("vehicles")) || [];
            vehicles.push({ name: vehicleName, odometer: parseInt(initialOdometer), trips: [], stkValidity: null, serviceDate: null });
            localStorage.setItem("vehicles", JSON.stringify(vehicles));
            displayVehicles();
        } else {
            alert("Vyplňte všechny údaje!");
        }
    });

    // Funkce pro potvrzení a odstranění vozidla
    window.confirmDeleteVehicle = function(index) {
        const confirmFirst = confirm("Opravdu chcete odstranit toto vozidlo?");
        if (confirmFirst) {
            const confirmSecond = confirm("Toto je nevratná akce. Jste si jisti?");
            if (confirmSecond) {
                deleteVehicle(index);
            }
        }
    };

    function deleteVehicle(index) {
        const vehicles = JSON.parse(localStorage.getItem("vehicles")) || [];
        vehicles.splice(index, 1);
        localStorage.setItem("vehicles", JSON.stringify(vehicles));
        displayVehicles();
    }

    // Vytvoření tabulky s jízdami
    function createTripsTable(trips = [], vehicleName) {
        if (!trips.length) return "<em>Žádné jízdy</em>";
    
        trips.sort((a, b) => new Date(a.date) - new Date(b.date));
    
        return `
            <button onclick="printTripsTable('${vehicleName}')">Tisk</button>
            <table id="tripsTable">
                <thead>
                    <tr>
                        <th>Datum</th>
                        <th>Místo odjezdu</th>
                        <th>Místo příjezdu</th>
                        <th>Účel</th>
                        <th>Počáteční tachometr</th>
                        <th>Konečný tachometr</th>
                        <th>Ujeto km</th>
                        <th>Řidič</th>
                    </tr>
                </thead>
                <tbody>
                    ${trips.map(trip => {
                        const dateObj = new Date(trip.date);
                        const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}.
                                               ${(dateObj.getMonth() + 1).toString().padStart(2, '0')}.
                                               ${dateObj.getFullYear()}`;
                        const ujetoKm = trip.finalOdometer - trip.initialOdometer;
                        return `
                            <tr>
                                <td>${formattedDate}</td>
                                <td>${trip.departure}</td>
                                <td>${trip.arrival}</td>
                                <td>${trip.purpose}</td>
                                <td>${trip.initialOdometer} km</td>
                                <td>${trip.finalOdometer} km</td>
                                <td>${ujetoKm} km</td>
                                <td>${trip.name}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }
    
        window.printTripsTable = printTripsTable;

   //tisk//
   function printTripsTable(vehicleName) {
    const tripsTable = document.getElementById("tripsTable");
    if (!tripsTable) {
        alert("Tabulka jízd nebyla nalezena.");
        return;
    }

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Tisk tabulky jízd</title>');
    printWindow.document.write('<style>table { width: 100%; border-collapse: collapse; } th, td { padding: 10px; border: 1px solid #ddd; text-align: left; } th { background-color: #4CAF50; color: white; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(`<h2>Jízdy vozidla: ${vehicleName}</h2>`);
    printWindow.document.write(tripsTable.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

    // Přidání nové jízdy
    window.addTrip = function(index) {
        const tripForm = document.getElementById("formularJizdy");
    
        if (tripForm.style.display === "none" || tripForm.style.display === "") {
            tripForm.style.display = "block";  // Otevře formulář pro přidání jízdy
            document.getElementById("datumJizdy").valueAsDate = new Date(); // Nastaví dnešní datum
        } else {
            tripForm.style.display = "none";  // Zavře formulář pro přidání jízdy
        }
    
        document.getElementById("vlozitJizdu").onclick = function() {
            const vehicles = JSON.parse(localStorage.getItem("vehicles"));
            const vehicle = vehicles[index];
    
            const departure = document.getElementById("mistoOdjezdu").value;
            const arrival = document.getElementById("mistoPrijezdu").value;
            const purpose = document.getElementById("ucelJizdy").value;
            const finalOdometer = parseInt(document.getElementById("konecnyTachometr").value);
            const name = document.getElementById("jizduProvedl").value;
            const date = document.getElementById("datumJizdy").value;
    
            if (departure && arrival && purpose && !isNaN(finalOdometer) && name && date) {
                const initialOdometer = vehicle.odometer;
                const newTrip = { date, departure, arrival, purpose, initialOdometer, finalOdometer, name };
    
                vehicle.trips.push(newTrip);
                vehicle.trips.sort((a, b) => new Date(a.date) - new Date(b.date));
                vehicle.odometer = finalOdometer; // Aktualizuje aktuální stav tachometru
    
                vehicles[index] = vehicle;
                localStorage.setItem("vehicles", JSON.stringify(vehicles));
                alert("Jízda přidána!");
    
                tripForm.style.display = "none";
                displayVehicles();
            } else {
                alert("Vyplňte všechny údaje o jízdě!");
            }
        };
    };

    // Dotankování
    window.showRefuelForm = function(index) {
        const refuelForm = document.getElementById("formularDotankovani");
        const vehicleCard = document.querySelectorAll(".vehicle-card")[index];
        const existingRefuelsContainer = vehicleCard.querySelector(".refuels-container");
    
        if (refuelForm.style.display === "none" || refuelForm.style.display === "") {
            refuelForm.style.display = "block"; // Otevře formulář pro dotankování
            if (existingRefuelsContainer) {
                existingRefuelsContainer.style.display = "block"; // Zobrazí tabulku dotankování
            } else {
                displayRefuels(index); // Vytvoří a zobrazí tabulku dotankování
            }
        } else {
            refuelForm.style.display = "none"; // Zavře formulář pro dotankování
            if (existingRefuelsContainer) {
                existingRefuelsContainer.style.display = "none"; // Skryje tabulku dotankování
            }
        }
    
        document.getElementById("ulozitDotankovani").onclick = function() {
            const vehicles = JSON.parse(localStorage.getItem("vehicles"));
            const vehicle = vehicles[index];
    
            const odometer = document.getElementById("stavKilometruDotankovani").value;
            const liters = document.getElementById("litry").value;
            const amount = document.getElementById("castka").value;
            const refueledBy = document.getElementById("kdoDotankoval").value;
    
            if (odometer && liters && amount && refueledBy) {
                const refuel = {
                    date: new Date().toISOString().split('T')[0],
                    odometer: parseInt(odometer),
                    liters: parseFloat(liters),
                    amount: parseFloat(amount),
                    refueledBy: refueledBy
                };
    
                if (!vehicle.refuels) {
                    vehicle.refuels = [];
                }
    
                vehicle.refuels.push(refuel);
                vehicles[index] = vehicle;
                localStorage.setItem("vehicles", JSON.stringify(vehicles));
                alert("Dotankování uloženo!");
    
                refuelForm.style.display = "none";
                displayVehicles();
            } else {
                alert("Vyplňte všechny údaje o dotankování!");
            }
        };
    };

    function displayRefuels(index) {
        const vehicles = JSON.parse(localStorage.getItem("vehicles"));
        const vehicle = vehicles[index];
        const refuelsContainer = document.createElement("div");
        refuelsContainer.classList.add("refuels-container");
    
        if (vehicle.refuels && vehicle.refuels.length > 0) {
            refuelsContainer.innerHTML = `
                <h3>Seznam dotankování</h3>
                <button onclick="printRefuelsTable(${index}, '${vehicle.name}')">Tisk</button>
                <table id="refuelsTable-${index}">
                    <thead>
                        <tr>
                            <th>Datum</th>
                            <th>Stav tachometru</th>
                            <th>Litry</th>
                            <th>Částka</th>
                            <th>Kdo dotankoval</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${vehicle.refuels.map(refuel => {
                            const dateObj = new Date(refuel.date);
                            const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}.
                                                   ${(dateObj.getMonth() + 1).toString().padStart(2, '0')}.
                                                   ${dateObj.getFullYear()}`;
                            return `
                                <tr>
                                    <td>${formattedDate}</td>
                                    <td>${refuel.odometer} km</td>
                                    <td>${refuel.liters} l</td>
                                    <td>${refuel.amount} Kč</td>
                                    <td>${refuel.refueledBy}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        } else {
            refuelsContainer.innerHTML = "<em>Žádná dotankování</em>";
        }
    
        const vehicleCard = document.querySelectorAll(".vehicle-card")[index];
        const existingRefuelsContainer = vehicleCard.querySelector(".refuels-container");
        if (existingRefuelsContainer) {
            vehicleCard.removeChild(existingRefuelsContainer);
        }
        vehicleCard.appendChild(refuelsContainer);
    }
    
    // Funkce pro tisk tabulky dotankování
window.printRefuelsTable = function(index, vehicleName) {
    const refuelsTable = document.getElementById(`refuelsTable-${index}`);
    if (!refuelsTable) {
        alert("Tabulka dotankování nebyla nalezena.");
        return;
    }

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Tisk tabulky dotankování</title>');
    printWindow.document.write('<style>table { width: 100%; border-collapse: collapse; } th, td { padding: 10px; border: 1px solid #ddd; text-align: left; } th { background-color: #4CAF50; color: white; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(`<h2>Dotankování vozidla: ${vehicleName}</h2>`);
    printWindow.document.write(refuelsTable.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

    // Servis//
    window.showServiceForm = function(index) {
        const serviceForm = document.getElementById("formularServis");
        const vehicleCard = document.querySelectorAll(".vehicle-card")[index];
        const existingServicesContainer = vehicleCard.querySelector(".services-container");
    
        if (serviceForm.style.display === "none" || serviceForm.style.display === "") {
            serviceForm.style.display = "block"; // Otevře formulář pro servis
            if (existingServicesContainer) {
                existingServicesContainer.style.display = "block"; // Zobrazí tabulku servisů
            } else {
                displayServices(index); // Vytvoří a zobrazí tabulku servisů
            }
        } else {
            serviceForm.style.display = "none"; // Zavře formulář pro servis
            if (existingServicesContainer) {
                existingServicesContainer.style.display = "none"; // Skryje tabulku servisů
            }
        }
    
        document.getElementById("ulozitServis").onclick = function() {
            const vehicles = JSON.parse(localStorage.getItem("vehicles"));
            const vehicle = vehicles[index];
    
            const serviceDate = document.getElementById("datumServisu").value;
            const serviceDescription = document.getElementById("popisServisu").value;
    
            if (serviceDate && serviceDescription) {
                const dateObj = new Date(serviceDate);
                const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}.
                                       ${(dateObj.getMonth() + 1).toString().padStart(2, '0')}.
                                       ${dateObj.getFullYear()}`;
    
                const service = {
                    date: formattedDate,
                    description: serviceDescription
                };
    
                if (!vehicle.services) {
                    vehicle.services = [];
                }
    
                vehicle.services.push(service);
                vehicle.serviceDate = formattedDate; // Aktualizuje datum posledního servisu
                vehicles[index] = vehicle;
                localStorage.setItem("vehicles", JSON.stringify(vehicles));
                alert("Servis uložen!");
    
                serviceForm.style.display = "none";
                displayVehicles();
            } else {
                alert("Vyplňte všechny údaje o servisu!");
            }
        };
    };

    
    function displayServices(index) {
        const vehicles = JSON.parse(localStorage.getItem("vehicles"));
        const vehicle = vehicles[index];
        const servicesContainer = document.createElement("div");
        servicesContainer.classList.add("services-container");
    
        if (vehicle.services && vehicle.services.length > 0) {
            servicesContainer.innerHTML = `
                <h3>Seznam servisů</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Datum</th>
                            <th>Popis servisu</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${vehicle.services.map(service => `
                            <tr>
                                <td>${service.date}</td>
                                <td>${service.description}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            servicesContainer.innerHTML = "<em>Žádné servisy</em>";
        }
    
        const vehicleCard = document.querySelectorAll(".vehicle-card")[index];
        const existingServicesContainer = vehicleCard.querySelector(".services-container");
        if (existingServicesContainer) {
            vehicleCard.removeChild(existingServicesContainer);
        }
        vehicleCard.appendChild(servicesContainer);
    }

    // STK
    window.showSTKForm = function(index) {
        const stkForm = document.getElementById("formularSTK");

        if (stkForm.style.display === "none" || stkForm.style.display === "") {
            stkForm.style.display = "block"; // Otevře formulář pro STK
        } else {
            stkForm.style.display = "none"; // Zavře formulář pro STK
        }

        document.getElementById("ulozitSTK").onclick = function() {
            const vehicles = JSON.parse(localStorage.getItem("vehicles"));
            const vehicle = vehicles[index];

            const stkDate = document.getElementById("datumSTK").value;

            if (stkDate) {
                const stkValidityDate = new Date(stkDate);
                stkValidityDate.setFullYear(stkValidityDate.getFullYear() + 1); // Přidá jeden rok

                const formattedStkValidity = `${stkValidityDate.getDate().toString().padStart(2, '0')}.
                                               ${(stkValidityDate.getMonth() + 1).toString().padStart(2, '0')}.
                                               ${stkValidityDate.getFullYear()}`;

                vehicle.stkValidity = formattedStkValidity;
                vehicle.stkDate = stkDate;

                vehicles[index] = vehicle;
                localStorage.setItem("vehicles", JSON.stringify(vehicles));
                alert("STK uloženo!");

                stkForm.style.display = "none";
                displayVehicles();
            } else {
                alert("Vyplňte všechny údaje o STK!");
            }
        };
    };

    updateUI();
});