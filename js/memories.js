$(function () {
    const defaultMemories = [];

    let memories = loadMemories();
    let pendingDeleteId = null;
    let $lastDeleteButton = null;

    const $cards = $("#memoryCards");
    const $formPanel = $("#memoryFormPanel");
    const $form = $("#memoryForm");
    const $deleteOverlay = $("#deleteConfirmOverlay");
    const today = new Date().toISOString().split("T")[0];

    $("#memory-date").attr("max", today);

    function loadMemories() {
        try {
            const saved = localStorage.getItem("wanderMatchMemories");
            const loaded = saved ? JSON.parse(saved) : defaultMemories.slice();

            const oldDemoPlaces = ["Madeira", "Bali", "Tokyo"];
            const isOldDemoSet = Array.isArray(loaded) &&
                loaded.length === 3 &&
                loaded.every(function (memory, index) {
                    return memory && memory.id === index + 1 && memory.place === oldDemoPlaces[index];
                });

            if (isOldDemoSet) {
                localStorage.setItem("wanderMatchMemories", JSON.stringify([]));
                return [];
            }

            if (!Array.isArray(loaded)) {
                return defaultMemories.slice();
            }

            let changed = false;
            const normalized = loaded.map(function (memory) {
                let normalizedMemory = memory;

                if (memory.date && memory.date > new Date().toISOString().split("T")[0]) {
                    normalizedMemory = Object.assign({}, normalizedMemory, { date: new Date().toISOString().split("T")[0] });
                    changed = true;
                }

                if (!normalizedMemory.image || normalizedMemory.image.startsWith("data:image/")) {
                    return normalizedMemory;
                }

                const destinationForImage = destinations.find(function (destination) {
                    return destination.image === normalizedMemory.image;
                });

                if (
                    destinationForImage &&
                    destinationForImage.name.toLowerCase() !== String(normalizedMemory.place).toLowerCase()
                ) {
                    changed = true;
                    return Object.assign({}, normalizedMemory, { image: "" });
                }

                return normalizedMemory;
            });

            if (changed) {
                localStorage.setItem("wanderMatchMemories", JSON.stringify(normalized));
            }

            return normalized;
        } catch (error) {
            return defaultMemories.slice();
        }
    }

    function saveMemories() {
        try {
            localStorage.setItem("wanderMatchMemories", JSON.stringify(memories));
            return true;
        } catch (error) {
            return false;
        }
    }

    function setMemoryError(fieldId, message) {
        $("#" + fieldId)
            .addClass("is-invalid")
            .attr("aria-invalid", "true");
        $("#" + fieldId + "Error").text(message).show();
        return false;
    }

    function clearMemoryError(fieldId) {
        $("#" + fieldId)
            .removeClass("is-invalid")
            .attr("aria-invalid", "false");
        $("#" + fieldId + "Error").text("").hide();
        return true;
    }

    function validateMemoryPlace() {
        const value = $("#memory-place").val().trim();

        if (!value) {
            return setMemoryError("memory-place", "Place is required.");
        }

        if (value.length < 2) {
            return setMemoryError("memory-place", "Place must contain at least 2 characters.");
        }

        if (value.length > 60) {
            return setMemoryError("memory-place", "Place must be 60 characters or fewer.");
        }

        if (/\d/.test(value)) {
            return setMemoryError("memory-place", "Place name cannot contain numbers.");
        }

        if (!/^[\p{L}\p{M}\s.'’-]+$/u.test(value)) {
            return setMemoryError(
                "memory-place",
                "Use letters, spaces, hyphens, apostrophes or periods only."
            );
        }

        const letterCount = (value.match(/\p{L}/gu) || []).length;
        if (letterCount < 2) {
            return setMemoryError(
                "memory-place",
                "Place name must contain at least 2 letters, not only symbols."
            );
        }

        return clearMemoryError("memory-place");
    }

    function validateMemoryDate() {
        const value = $("#memory-date").val();

        if (!value) {
            return setMemoryError("memory-date", "Visit date is required.");
        }

        if (value < "1900-01-01") {
            return setMemoryError("memory-date", "Choose a visit date from 1900 or later.");
        }

        if (value > today) {
            return setMemoryError("memory-date", "Visit date cannot be in the future.");
        }

        return clearMemoryError("memory-date");
    }

    function validateMemoryRating() {
        const rawValue = $("#memory-rating").val().trim();

        if (!rawValue) {
            return setMemoryError("memory-rating", "Rating is required.");
        }

        const rating = Number(rawValue);

        if (!Number.isFinite(rating)) {
            return setMemoryError("memory-rating", "Rating must be a number.");
        }

        if (rating < 1) {
            return setMemoryError("memory-rating", "Rating cannot be lower than 1.");
        }

        if (rating > 5) {
            return setMemoryError("memory-rating", "Rating cannot be higher than 5.");
        }

        if (Math.round(rating * 10) !== rating * 10) {
            return setMemoryError("memory-rating", "Use no more than one decimal place, for example 4.5.");
        }

        return clearMemoryError("memory-rating");
    }

    function validateMemoryText() {
        const value = $("#memory-text").val().trim();

        if (!value) {
            return setMemoryError("memory-text", "Memory text is required.");
        }

        if (value.length < 10) {
            return setMemoryError(
                "memory-text",
                "Write at least 10 characters. You currently have " + value.length + "."
            );
        }

        if (value.length > 500) {
            return setMemoryError("memory-text", "Memory text cannot exceed 500 characters.");
        }

        return clearMemoryError("memory-text");
    }

    function validateMemoryImage() {
        const file = $("#memory-image")[0].files[0];

        if (!file) {
            return clearMemoryError("memory-image");
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.type)) {
            return setMemoryError("memory-image", "Choose a JPG, PNG or WebP image.");
        }

        if (file.size > 5 * 1024 * 1024) {
            return setMemoryError("memory-image", "Photo must be 5 MB or smaller.");
        }

        return clearMemoryError("memory-image");
    }

    const memoryValidators = {
        "memory-place": validateMemoryPlace,
        "memory-date": validateMemoryDate,
        "memory-rating": validateMemoryRating,
        "memory-text": validateMemoryText,
        "memory-image": validateMemoryImage
    };

    function validateMemoryForm() {
        return [
            validateMemoryPlace(),
            validateMemoryDate(),
            validateMemoryRating(),
            validateMemoryText(),
            validateMemoryImage()
        ].every(Boolean);
    }

    function updateMemoryCounter() {
        $("#memoryTextCount").text($("#memory-text").val().length + " / 500");
    }

    function formatDate(dateString) {
        return new Date(dateString + "T00:00:00").toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    function createMemoryMedia(memory) {
        if (memory.image) {
            return $("<img>")
                .attr("src", memory.image)
                .attr("alt", "Travel memory from " + memory.place);
        }

        return $("<div>")
            .addClass("memory-photo-placeholder")
            .attr({
                role: "img",
                "aria-label": "Neutral travel placeholder with an airplane"
            })
            .append($("<span>").addClass("memory-plane-icon").attr("aria-hidden", "true").text("✈"))
            .append($("<span>").addClass("memory-placeholder-text").text("Travel memory"));
    }

    function renderMemories() {
        $cards.empty();

        memories.forEach(function (memory) {
            const $card = $("<article>")
                .addClass("memory-card")
                .append(createMemoryMedia(memory))
                .append(
                    $("<div>")
                        .addClass("memory-text")
                        .append($("<h2>").text(memory.place))
                        .append($("<p>").addClass("memory-date").text("Visited " + formatDate(memory.date)))
                        .append($("<p>").text(memory.memory))
                        .append($("<p>").addClass("memory-rating").text("Rating: " + memory.rating + " / 5"))
                        .append(
                            $("<button>")
                                .attr("type", "button")
                                .addClass("delete-memory-button")
                                .attr("data-id", memory.id)
                                .text("Delete memory")
                        )
                );

            $cards.append($card);
        });

        const average = memories.length
            ? memories.reduce(function (total, memory) {
                return total + Number(memory.rating);
            }, 0) / memories.length
            : 0;

        $("#memoryStats").text(
            memories.length + " memories · Average rating " + average.toFixed(1) + " / 5"
        );

        $("#memoryEmpty").prop("hidden", memories.length !== 0);
    }

    function resizeUploadedImage(file) {
        return new Promise(function (resolve, reject) {
            if (!file) {
                resolve("");
                return;
            }

            const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

            if (!allowedTypes.includes(file.type)) {
                reject(new Error("Choose a JPG, PNG or WebP image."));
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                reject(new Error("Photo must be 5 MB or smaller."));
                return;
            }

            const reader = new FileReader();

            reader.onerror = function () {
                reject(new Error("The image could not be read. Please choose another file."));
            };

            reader.onload = function (event) {
                const image = new Image();

                image.onerror = function () {
                    reject(new Error("The selected file is not a valid image."));
                };

                image.onload = function () {
                    const maxWidth = 1200;
                    const maxHeight = 800;
                    const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
                    const width = Math.round(image.width * scale);
                    const height = Math.round(image.height * scale);
                    const canvas = document.createElement("canvas");
                    const context = canvas.getContext("2d");

                    canvas.width = width;
                    canvas.height = height;
                    context.drawImage(image, 0, 0, width, height);

                    let dataUrl = canvas.toDataURL("image/jpeg", 0.82);

                    if (dataUrl.length > 1800000) {
                        dataUrl = canvas.toDataURL("image/jpeg", 0.65);
                    }

                    if (dataUrl.length > 2500000) {
                        reject(new Error("This photo is still too large for browser storage after compression. Choose a smaller image."));
                        return;
                    }

                    resolve(dataUrl);
                };

                image.src = event.target.result;
            };

            reader.readAsDataURL(file);
        });
    }

    function showActionStatus(message) {
        $("#memoryActionStatus")
            .stop(true, true)
            .hide()
            .text(message)
            .fadeIn(180)
            .delay(1400)
            .fadeOut(280);
    }

    function openDeleteConfirmation(id, place, $button) {
        pendingDeleteId = id;
        $lastDeleteButton = $button;
        $("#deleteMemoryName").text(place);

        $deleteOverlay
            .prop("hidden", false)
            .stop(true, true)
            .hide()
            .fadeIn(160, function () {
                $("#cancelDeleteMemory").trigger("focus");
            });
    }

    function closeDeleteConfirmation() {
        $deleteOverlay
            .stop(true, true)
            .fadeOut(140, function () {
                $deleteOverlay.prop("hidden", true);
                pendingDeleteId = null;

                if ($lastDeleteButton && $lastDeleteButton.length) {
                    $lastDeleteButton.trigger("focus");
                }

                $lastDeleteButton = null;
            });
    }

    $("#toggleMemoryForm").on("click", function () {
        if ($formPanel.prop("hidden")) {
            $formPanel.prop("hidden", false).hide();
        }

        $formPanel
            .stop(true, true)
            .slideToggle(250);
    });

    $form.on("blur", ".validate-memory", function () {
        const validator = memoryValidators[this.id];
        if (validator) {
            validator();
        }
    });

    $form.on("input", ".validate-memory", function () {
        if (this.id === "memory-text") {
            updateMemoryCounter();
        }

        if ($(this).hasClass("is-invalid")) {
            const validator = memoryValidators[this.id];
            if (validator) {
                validator();
            }
        }
    });

    $("#memory-date, #memory-image").on("change", function () {
        const validator = memoryValidators[this.id];
        if (validator) {
            validator();
        }
    });

    $form.on("submit", async function (event) {
        event.preventDefault();

        $("#memoryFormError").hide().text("");

        if (!validateMemoryForm()) {
            const $firstError = $form.find(".is-invalid").first();
            if ($firstError.length) {
                $firstError.trigger("focus");
            }
            return;
        }

        const place = $("#memory-place").val().trim();
        const date = $("#memory-date").val();
        const rating = Number($("#memory-rating").val());
        const text = $("#memory-text").val().trim();
        const file = $("#memory-image")[0].files[0];
        const $submit = $form.find('button[type="submit"]');

        $submit.prop("disabled", true).text("Saving…");

        try {
            const uploadedImage = await resizeUploadedImage(file);
            const newMemory = {
                id: Date.now(),
                place: place,
                date: date,
                rating: rating,
                memory: text,
                image: uploadedImage
            };

            memories.push(newMemory);

            if (!saveMemories()) {
                memories.pop();
                throw new Error("Browser storage is full. Try a smaller image or delete an old memory.");
            }

            renderMemories();
            this.reset();
            $form.find(".is-invalid").removeClass("is-invalid").attr("aria-invalid", "false");
            $form.find(".field-error").hide().text("");
            updateMemoryCounter();
            $("#memorySaved")
                .stop(true, true)
                .hide()
                .text(uploadedImage
                    ? "Memory saved with your photo in this browser."
                    : "Memory saved with a neutral travel placeholder.")
                .fadeIn(200)
                .delay(1400)
                .fadeOut(300);
        } catch (error) {
            $("#memoryFormError")
                .stop(true, true)
                .text(error.message)
                .fadeIn(180);
        } finally {
            $submit.prop("disabled", false).text("Save Memory");
        }
    });

    $cards.on("click", ".delete-memory-button", function () {
        const id = Number($(this).attr("data-id"));
        const memory = memories.find(function (item) {
            return item.id === id;
        });

        if (!memory) {
            return;
        }

        openDeleteConfirmation(id, memory.place, $(this));
    });

    $("#cancelDeleteMemory").on("click", closeDeleteConfirmation);

    $("#confirmDeleteMemory").on("click", function () {
        if (pendingDeleteId === null) {
            return;
        }

        const deletedMemory = memories.find(function (memory) {
            return memory.id === pendingDeleteId;
        });

        memories = memories.filter(function (memory) {
            return memory.id !== pendingDeleteId;
        });

        saveMemories();
        renderMemories();

        $deleteOverlay
            .stop(true, true)
            .fadeOut(140, function () {
                $deleteOverlay.prop("hidden", true);
                pendingDeleteId = null;
                $lastDeleteButton = null;
                showActionStatus((deletedMemory ? deletedMemory.place : "Memory") + " was deleted.");
            });
    });

    $deleteOverlay.on("click", function (event) {
        if (event.target === this) {
            closeDeleteConfirmation();
        }
    });

    $(document).on("keydown", function (event) {
        if (event.key === "Escape" && !$deleteOverlay.prop("hidden")) {
            closeDeleteConfirmation();
        }
    });

    updateMemoryCounter();
    renderMemories();
});
