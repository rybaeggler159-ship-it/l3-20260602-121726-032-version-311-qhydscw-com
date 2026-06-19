(function () {
    var body = document.body;
    var menuButton = document.querySelector(".menu-toggle");
    var mobileMenu = document.getElementById("mobile-menu");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            var isOpen = mobileMenu.classList.toggle("open");
            body.classList.toggle("menu-open", isOpen);
            menuButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    var scopes = document.querySelectorAll("[data-filter-scope]");

    scopes.forEach(function (scope) {
        var input = scope.querySelector("[data-card-search]");
        var sort = scope.querySelector("[data-sort-cards]");
        var grids = scope.querySelectorAll(".card-grid, .rank-list");

        function getCards() {
            return Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
        }

        function getText(card) {
            return [
                card.dataset.title || "",
                card.dataset.year || "",
                card.dataset.type || "",
                card.dataset.region || "",
                card.dataset.tags || ""
            ].join(" ").toLowerCase();
        }

        function filterCards() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            getCards().forEach(function (card) {
                card.classList.toggle("hidden-card", keyword && getText(card).indexOf(keyword) === -1);
            });
        }

        function sortCards() {
            if (!sort) {
                return;
            }

            var value = sort.value;

            grids.forEach(function (grid) {
                var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));

                cards.sort(function (a, b) {
                    if (value === "year") {
                        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                    }

                    if (value === "title") {
                        return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
                    }

                    return Number(b.dataset.hot || 0) - Number(a.dataset.hot || 0);
                });

                cards.forEach(function (card) {
                    grid.appendChild(card);
                });
            });
        }

        if (input) {
            input.addEventListener("input", filterCards);
        }

        if (sort) {
            sort.addEventListener("change", function () {
                sortCards();
                filterCards();
            });
        }
    });
})();
