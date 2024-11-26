document.addEventListener("DOMContentLoaded", () => {
    // Dane o przedmiotach
    const items = [
        {
            id: "item1",
            title: "Zegarek męski",
            description: "Stylowy zegarek na każdą okazję.",
            price: "299.99 zł",
            image: "https://via.placeholder.com/200" // Podmień na własny URL do zdjęcia
        },
        {
            id: "item2",
            title: "Rower górski",
            description: "Solidny rower do jazdy po górach i lesie.",
            price: "1200 zł",
            image: "https://via.placeholder.com/200" // Podmień na własny URL do zdjęcia
        },
        {
            id: "item3",
            title: "Laptop gamingowy",
            description: "Wydajny laptop do gier i pracy.",
            price: "4999 zł",
            image: "https://via.placeholder.com/200" // Podmień na własny URL do zdjęcia
        }
    ];

    const itemList = document.getElementById("item-list");
    const itemsContainer = document.getElementById("items-container");

    // Generowanie listy po lewej stronie
    items.forEach(item => {
        const listItem = document.createElement("li");
        listItem.textContent = item.title;
        listItem.dataset.target = item.id;
        listItem.addEventListener("click", () => {
            document.getElementById(item.id).scrollIntoView({ behavior: "smooth" });
        });
        itemList.appendChild(listItem);
    });

    // Generowanie szczegółów przedmiotów
    items.forEach(item => {
        const itemSection = document.createElement("div");
        itemSection.className = "item";
        itemSection.id = item.id;

        itemSection.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <p class="price">${item.price}</p>
        `;
        itemsContainer.appendChild(itemSection);
    });
});
