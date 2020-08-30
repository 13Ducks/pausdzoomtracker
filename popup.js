window.browser = (function () {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();

$(function () {
    var allFields = $(".pinput").map(function () {
        return this.id;
    }).get();

    const createItem = function (div, period) {
        const actualClass = allFields.includes("p" + period['name']);

        periodDiv = $("<div>", { id: div.id + period['name'] });
        div.append(periodDiv);

        periodDivTop = $("<div>", { id: div.id + period['name'] + "top" });
        periodDiv.append(periodDivTop);

        periodDivTop.css({ "display": "flex" });
        periodDivTop.append($("<p>", {
            class: "periodtext", text: period["name"] +
                (period.gunnTogether ? " (Gunn Together)" : "") + (actualClass ? ":" : "")
        }))
        if (actualClass)
            periodDivTop.append($('<button>', { id: "p" + period['name'] + "buttonschedule", class: "schedulebutton", text: "Open" }))

        const startStr = formatHM(period['start']['hour'], period['start']['minute']);
        const endStr = formatHM(period['end']['hour'], period['end']['minute']);

        periodDivBottom = $("<div>", { id: div.id + period['name'] + "bottom" });
        periodDiv.append(periodDivBottom);
        periodDivBottom.append($('<p>', { class: "periodtimetext", text: startStr + " - " + endStr }));
    };

    generateClassList = function () {
        const now = Date.now();
        const normalSchedule = generateSchedule(now);
        const d = new Date();

        const day = d.getDay();

        $("#timetext").text("Time: " + formatHM(d.getHours(), d.getMinutes()));
        const totalMinutes = d.getHours() * 60 + d.getMinutes();

        const daySchedule = normalSchedule[day];

        const upcomingDiv = $('#upcomingdiv');
        const currentDiv = $('#currentdiv')
        const passedDiv = $('#passeddiv');

        upcomingDiv.empty();
        currentDiv.empty();
        passedDiv.empty();

        if (daySchedule) {
            for (const key of Object.keys(daySchedule)) {
                const period = daySchedule[key];
                if (totalMinutes < period['start']['totalminutes']) {
                    createItem(upcomingDiv, period);
                } else if (totalMinutes >= period['start']['totalminutes'] && totalMinutes < period['end']['totalminutes']) {
                    createItem(currentDiv, period);
                } else if (totalMinutes >= period['end']['totalminutes']) {
                    createItem(passedDiv, period);
                }
            }

            $(".periodtext").css({ "flex": "auto", "margin": "0px", "padding": "0px" });
            $(".periodtimetext").css({ "margin": "0px", "padding": "0px", "margin-bottom": "20px", "margin-top": "5px" });
            $(".schedulebutton").css({ "cursor": "pointer" });
        } else {
            $("#currenttext").text("No");
            $("#upcomingtext").text("Class");
            $("#passedtext").text("Today!");
        }
    }

    generateClassList();
    setInterval(generateClassList, 1000 * 60);

    browser.storage.sync.get(allFields, function (items) {
        for (const key of Object.keys(items)) {
            $("#" + key).val(items[key]);
        }
    });

    $("#tabs").tabs();

    $(".pbutton, .schedulebutton").on("click", function (event) {
        const targetID = event.target.id;
        const linkID = "#" + targetID.substring(0, targetID.indexOf("button"));
        let link = $(linkID).val();

        if (!link.startsWith("https://")) link = "https://" + link;

        browser.tabs.create({
            url: link
        });
    });

    $('.pinput').each(function () {
        $(this).blur(function () {
            browser.storage.sync.set({ [this.id]: $("#" + this.id).val() });
        });
    })

    $("#fullschedule").on("click", function () {
        browser.tabs.create({
            url: "https://gunn.pausd.org/campus-life/bell-schedule/"
        });
    });

    $("#ugwalink").on("click", function () {
        browser.tabs.create({
            url: "https://orbiit.github.io/gunn-web-app/"
        });
    });
});

function formatHM(h, m) {
    const period = h >= 12 ? 'PM' : 'AM';
    const hours = ((h + 11) % 12 + 1).toString();
    const minutes = zfill(m, 2);
    return hours + ":" + minutes + " " + period;
}

function zfill(number, size) {
    number = number.toString();
    while (number.length < size) number = "0" + number;
    return number;
}