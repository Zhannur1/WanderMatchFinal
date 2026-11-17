$(function () {
    const $form = $("#matchForm");
    const $resultSection = $("#matchResults");
    const $resultList = $("#matchResultList");
    const $success = $("#formSuccess");

    function setError(fieldId, message) {
        const $field = $("#" + fieldId);
        const $error = $("#" + fieldId + "Error");

        $field
            .addClass("is-invalid")
            .attr("aria-invalid", "true");
        $error.text(message).show();
        return false;
    }

    function clearError(fieldId) {
        $("#" + fieldId)
            .removeClass("is-invalid")
            .attr("aria-invalid", "false");
        $("#" + fieldId + "Error").text("").hide();
        return true;
    }

    function setGroupError(groupId, errorId, message) {
        $("#" + groupId)
            .addClass("group-invalid")
            .attr("aria-invalid", "true");
        $("#" + errorId).text(message).show();
        return false;
    }

    function clearGroupError(groupId, errorId) {
        $("#" + groupId)
            .removeClass("group-invalid")
            .attr("aria-invalid", "false");
        $("#" + errorId).text("").hide();
        return true;
    }

    function validateFullName() {
        const value = $("#full-name").val().trim();
        const words = value.split(/\s+/).filter(Boolean);

        if (!value) {
            return setError("full-name", "Full name is required.");
        }

        if (value.length < 5) {
            return setError("full-name", "Use at least 5 characters for your first and last name.");
        }

        if (value.length > 60) {
            return setError("full-name", "Full name must be 60 characters or fewer.");
        }

        if (words.length < 2) {
            return setError("full-name", "Enter both your first name and last name.");
        }

        if (/\d/.test(value)) {
            return setError("full-name", "Names cannot contain numbers.");
        }

        if (!/^[\p{L}\p{M}\s.'’-]+$/u.test(value)) {
            return setError(
                "full-name",
                "Use letters, spaces, hyphens, apostrophes or periods only."
            );
        }

        const invalidNamePart = words.find(function (word) {
            const letterCount = (word.match(/\p{L}/gu) || []).length;
            return letterCount < 2;
        });

        if (invalidNamePart) {
            return setError(
                "full-name",
                "Each name part must contain at least 2 letters, not only symbols."
            );
        }

        return clearError("full-name");
    }

    function validateEmail() {
        const value = $("#email").val().trim();

        if (!value) {
            return setError("email", "Email is required.");
        }

        if (value.length > 100) {
            return setError("email", "Email must be 100 characters or fewer.");
        }

        if (/\s/.test(value)) {
            return setError("email", "Email cannot contain spaces.");
        }

        const atCount = (value.match(/@/g) || []).length;

        if (atCount === 0) {
            return setError("email", "Add the @ symbol, for example name@example.com.");
        }

        if (atCount > 1) {
            return setError("email", "Email can contain only one @ symbol.");
        }

        const parts = value.split("@");
        const localPart = parts[0];
        const domain = parts[1];

        if (!localPart) {
            return setError("email", "Enter a name before the @ symbol.");
        }

        if (!domain) {
            return setError("email", "Enter a domain after the @ symbol.");
        }

        if (!domain.includes(".")) {
            return setError("email", "Add a domain ending after the dot, for example .com.");
        }

        if (domain.startsWith(".") || domain.endsWith(".")) {
            return setError("email", "The domain cannot start or end with a dot.");
        }

        if (value.includes("..")) {
            return setError("email", "Email cannot contain two dots in a row.");
        }

        if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(value)) {
            return setError("email", "Check the email format. Example: name@example.com.");
        }

        return clearError("email");
    }

    function validatePhone() {
        const value = $("#phone").val().trim();

        if (!value) {
            return setError("phone", "Phone number is required.");
        }

        if (!/^[+0-9\s()-]+$/.test(value)) {
            return setError("phone", "Use only digits, spaces, +, - and brackets.");
        }

        if (value.includes("+") && !value.startsWith("+")) {
            return setError("phone", "The + sign can appear only at the beginning.");
        }

        if ((value.match(/\+/g) || []).length > 1) {
            return setError("phone", "Use no more than one + sign.");
        }

        const digitCount = value.replace(/\D/g, "").length;

        if (digitCount < 10) {
            return setError("phone", "Phone number must contain at least 10 digits.");
        }

        if (digitCount > 15) {
            return setError("phone", "Phone number must contain no more than 15 digits.");
        }

        return clearError("phone");
    }

    function validateBudget() {
        const rawValue = $("#budget").val().trim();

        if (!rawValue) {
            return setError("budget", "Budget is required.");
        }

        const budget = Number(rawValue);

        if (!Number.isFinite(budget)) {
            return setError("budget", "Budget must be a number.");
        }

        if (!Number.isInteger(budget)) {
            return setError("budget", "Enter the budget as a whole USD amount.");
        }

        if (budget < 300) {
            return setError("budget", "Budget must be at least $300.");
        }

        if (budget > 15000) {
            return setError("budget", "Budget cannot exceed $15,000.");
        }

        return clearError("budget");
    }

    function validateTripDays() {
        const rawValue = $("#trip-days").val().trim();

        if (!rawValue) {
            return setError("trip-days", "Trip length is required.");
        }

        const days = Number(rawValue);

        if (!Number.isInteger(days)) {
            return setError("trip-days", "Trip length must be a whole number of days.");
        }

        if (days < 2) {
            return setError("trip-days", "Trip must be at least 2 days.");
        }

        if (days > 30) {
            return setError("trip-days", "Trip cannot be longer than 30 days.");
        }

        return clearError("trip-days");
    }

    function validateDreamTrip() {
        const value = $("#dream-trip").val().trim();

        if (!value) {
            return setError("dream-trip", "Dream trip description is required.");
        }

        if (value.length < 20) {
            return setError(
                "dream-trip",
                "Write at least 20 characters. You currently have " + value.length + "."
            );
        }

        if (value.length > 300) {
            return setError("dream-trip", "Dream trip description cannot exceed 300 characters.");
        }

        return clearError("dream-trip");
    }

    function validateStyle() {
        if ($("input[name='travel-style']:checked").length !== 1) {
            return setGroupError("styleChoices", "styleError", "Choose exactly one travel style.");
        }

        return clearGroupError("styleChoices", "styleError");
    }

    function validateInterests() {
        const count = $("input[name='interests']:checked").length;

        if (count === 0) {
            return setGroupError("interestChoices", "interestsError", "Choose at least one interest.");
        }

        if (count > 3) {
            return setGroupError("interestChoices", "interestsError", "Choose no more than 3 interests.");
        }

        return clearGroupError("interestChoices", "interestsError");
    }

    const fieldValidators = {
        "full-name": validateFullName,
        email: validateEmail,
        phone: validatePhone,
        budget: validateBudget,
        "trip-days": validateTripDays,
        "dream-trip": validateDreamTrip
    };

    function validateForm() {
        const results = [
            validateFullName(),
            validateEmail(),
            validatePhone(),
            validateBudget(),
            validateTripDays(),
            validateStyle(),
            validateInterests(),
            validateDreamTrip()
        ];

        return results.every(Boolean);
    }

    function updateDreamCounter() {
        const length = $("#dream-trip").val().length;
        $("#dreamTripCount").text(length + " / 300");
    }

    function scoreDestination(destination, preferences) {
        let score = 0;
        const reasons = [];

        if (destination.style === preferences.style) {
            score += 40;
            reasons.push("matches your " + preferences.style + " travel style");
        }

        const matchingInterests = destination.interests.filter(function (interest) {
            return preferences.interests.includes(interest);
        });

        score += matchingInterests.length * 18;

        if (matchingInterests.length > 0) {
            reasons.push("fits " + matchingInterests.join(" and "));
        }

        if (destination.dailyCost <= preferences.dailyBudget) {
            score += 20;
            reasons.push("fits your $" + Math.round(preferences.dailyBudget) + "/day budget");
        } else if (destination.dailyCost <= preferences.dailyBudget * 1.25) {
            score += 8;
            reasons.push("is close to your daily budget");
        }

        score += Math.round((destination.rating - 4.5) * 10);

        return {
            destination: destination,
            score: Math.min(score, 100),
            reasons: reasons.length ? reasons : ["offers a different experience worth exploring"]
        };
    }

    function createResultCard(match) {
        const destination = match.destination;

        return $("<article>")
            .addClass("match-card")
            .append(
                $("<img>")
                    .attr("src", destination.image)
                    .attr("alt", destination.name + ", " + destination.country)
            )
            .append(
                $("<div>")
                    .addClass("match-card-body")
                    .append($("<p>").addClass("match-score").text(match.score + "% match"))
                    .append($("<h3>").text(destination.name + ", " + destination.country))
                    .append($("<p>").text(destination.description))
                    .append($("<p>").addClass("match-reason").text("Why: " + match.reasons.join("; ") + "."))
                    .append($("<p>").text("Estimated daily cost: $" + destination.dailyCost))
                    .append(
                        $("<button>")
                            .attr({
                                type: "button",
                                "data-id": destination.id,
                                "aria-pressed": "false"
                            })
                            .addClass("save-trip-button")
                            .text("Save trip")
                    )
            );
    }

    function showMatches() {
        const interests = $("input[name='interests']:checked")
            .map(function () {
                return this.value;
            })
            .get();

        const budget = Number($("#budget").val());
        const days = Number($("#trip-days").val());
        const preferences = {
            style: $("input[name='travel-style']:checked").val(),
            interests: interests,
            dailyBudget: budget / days
        };

        const matches = destinations
            .map(function (destination) {
                return scoreDestination(destination, preferences);
            })
            .sort(function (a, b) {
                return b.score - a.score;
            })
            .slice(0, 3);

        $resultList.empty();
        matches.forEach(function (match) {
            $resultList.append(createResultCard(match));
        });

        if (window.WanderSaved) {
            window.WanderSaved.refresh();
        }

        $resultSection.prop("hidden", false).stop(true, true).hide().fadeIn(250);
        $("html, body")
            .stop(true, true)
            .animate({ scrollTop: $resultSection.offset().top - $(".site-header").outerHeight() - 16 }, 550);
    }

    $form.on("blur", ".validate-on-blur", function () {
        const validator = fieldValidators[this.id];
        if (validator) {
            validator();
        }
    });

    $form.on("input", ".validate-on-blur", function () {
        if (this.id === "dream-trip") {
            updateDreamCounter();
        }

        if ($(this).hasClass("is-invalid")) {
            const validator = fieldValidators[this.id];
            if (validator) {
                validator();
            }
        }
    });

    $("input[name='travel-style']").on("change", validateStyle);
    $("input[name='interests']").on("change", validateInterests);

    $form.on("submit", function (event) {
        event.preventDefault();

        if (!validateForm()) {
            $success.hide();
            const $firstError = $form.find(".is-invalid, .group-invalid input").first();
            if ($firstError.length) {
                $firstError.trigger("focus");
            }
            return;
        }

        showMatches();

        $success
            .stop(true, true)
            .hide()
            .text("Your preferences were processed successfully. Here are your best matches.")
            .fadeIn(250);

        $form.find(".is-invalid").removeClass("is-invalid").attr("aria-invalid", "false");
        $form.find(".group-invalid").removeClass("group-invalid").attr("aria-invalid", "false");
        $form.find(".field-error").hide().text("");
    });

    updateDreamCounter();
});
