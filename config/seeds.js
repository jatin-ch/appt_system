module.exports = {
    events: function() {
        var items = [
            {
                title: "August's First Event",
                begin: new Date("2020-08-22T09:00"),
                end: new Date("2020-08-22T18:00"),
                duration: 30,
                status: "New",
            },
            {
                title: "August's Second Event",
                begin: new Date("2020-08-23T09:00"),
                end: new Date("2020-08-23T18:00"),
                duration: 30,
                status: "New",
            },
            {
                title: "August's Third Event",
                begin: new Date("2020-08-25T09:00"),
                end: new Date("2020-08-25T18:00"),
                duration: 30,
                status: "New",
            }
        ]
        return items;
    },
    users: function() {
        var items = [
            {
                firstname: "Jatin",
                lastname: "Choudhary",
                phoneNo: "+91-8447645580"
            }
        ]
        return items;
    }
}