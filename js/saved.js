$(function () {
    const storageKey = "wanderMatchSaved";

    function loadSavedIds() {
        try {
            const saved = localStorage.getItem(storageKey);
            const parsed = saved ? JSON.parse(saved) : [];

            if (!Array.isArray(parsed)) {
                return [];
            }

            return parsed
                .map(Number)
                .filter(function (id, index, array) {
                    return Number.isInteger(id) && array.indexOf(id) === index;
                });
        } catch (error) {
            return [];
        }
    }

    function saveSavedIds(ids) {
        try {
            localStorage.setItem(storageKey, JSON.stringify(ids));
            return true;
        } catch (error) {
            return false;
        }
    }

    function isSaved(id) {
        return loadSavedIds().includes(Number(id));
    }

    function updateCounters() {
        const count = loadSavedIds().length;
        $(".saved-count")
            .text(count)
            .attr("aria-label", count + (count === 1 ? " saved destination" : " saved destinations"));
    }

    function updateSaveButtons() {
        $(".save-trip-button").each(function () {
            const $button = $(this);
            const id = Number($button.attr("data-id"));
            const saved = isSaved(id);

            $button
                .toggleClass("saved", saved)
                .attr("aria-pressed", String(saved))
                .text(saved ? "Saved ✓" : "Save trip");
        });
    }

    function getDestinationById(id) {
        if (typeof destinations === "undefined") {
            return null;
        }

        return destinations.find(function (destination) {
            return destination.id === Number(id);
        }) || null;
    }

    function showSavedStatus(message) {
        const $status = $("#savedActionStatus");

        if (!$status.length) {
            return;
        }

        $status
            .stop(true, true)
            .hide()
            .text(message)
            .fadeIn(160)
            .delay(1200)
            .fadeOut(260);
    }

    function renderSavedSection() {
        const $list = $("#savedTripsList");

        if (!$list.length || typeof destinations === "undefined") {
            return;
        }

        const ids = loadSavedIds();
        const savedDestinations = ids
            .map(getDestinationById)
            .filter(Boolean);

        $list.empty();

        savedDestinations.forEach(function (destination) {
            const styleLabel = destination.style.charAt(0).toUpperCase() + destination.style.slice(1);
            const $card = $("<article>")
                .addClass("saved-trip-card")
                .append(
                    $("<img>")
                        .attr("src", destination.image)
                        .attr("alt", destination.name + ", " + destination.country)
                )
                .append(
                    $("<div>")
                        .addClass("saved-trip-body")
                        .append($("<p>").addClass("style-badge").text(styleLabel))
                        .append($("<h3>").text(destination.name + ", " + destination.country))
                        .append($("<p>").text(destination.description))
                        .append($("<p>").addClass("saved-trip-meta").text("★ " + destination.rating + " · $" + destination.dailyCost + "/day"))
                        .append(
                            $("<button>")
                                .attr({
                                    type: "button",
                                    "data-id": destination.id
                                })
                                .addClass("remove-saved-button")
                                .text("Remove")
                        )
                );

            $list.append($card);
        });

        $("#savedTripsEmpty").prop("hidden", savedDestinations.length !== 0);
        $("#clearSavedTrips").prop("hidden", savedDestinations.length === 0);
        $("#savedTripsSummary").text(
            savedDestinations.length + (savedDestinations.length === 1 ? " saved destination" : " saved destinations")
        );
    }

    function notifySavedChanged(message) {
        updateCounters();
        updateSaveButtons();
        renderSavedSection();

        if (message) {
            showSavedStatus(message);
        }
    }

    $(document).on("click", ".save-trip-button", function () {
        const id = Number($(this).attr("data-id"));
        const ids = loadSavedIds();
        const index = ids.indexOf(id);
        const destination = getDestinationById(id);
        let message;

        if (index === -1) {
            ids.push(id);
            message = (destination ? destination.name : "Destination") + " was saved.";
        } else {
            ids.splice(index, 1);
            message = (destination ? destination.name : "Destination") + " was removed from saved trips.";
        }

        if (!saveSavedIds(ids)) {
            showSavedStatus("Saved trips could not be updated in this browser.");
            return;
        }

        notifySavedChanged(message);
    });

    $(document).on("click", ".remove-saved-button", function () {
        const id = Number($(this).attr("data-id"));
        const destination = getDestinationById(id);
        const ids = loadSavedIds().filter(function (savedId) {
            return savedId !== id;
        });

        if (saveSavedIds(ids)) {
            notifySavedChanged((destination ? destination.name : "Destination") + " was removed.");
        }
    });

    $("#clearSavedTrips").on("click", function () {
        if (saveSavedIds([])) {
            notifySavedChanged("All saved trips were cleared.");
        }
    });

    window.WanderSaved = {
        load: loadSavedIds,
        isSaved: isSaved,
        refresh: notifySavedChanged
    };

    notifySavedChanged();
});
