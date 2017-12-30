new Vue({
    el: '#gist',

    data: {
        user: {
            name: "",
            url: ""
        },
        gists: [],
        detail: null
        // detail: {
        //     title: "hoge2",
        //     files: [
        //         {
        //             name: "summary2",
        //             content: "ssss",
        //         },
        //         {
        //             name: "summary3",
        //             content: "sssse",
        //         },
        //         {
        //             name: "summary3",
        //             content: "sssse",
        //         },
        //     ],
        //     public: false,
        // }
    },

    created: function () {
        this.allLoad();
    },

    methods: {
        allLoad: function () {
            var self = this;
            axios.get('/all')
                .then(function (response) {
                    self.user = response.data.user;
                    self.gists = response.data.gists;
                    self.detail = response.data.detail;
                });
        // FIXME: error
        }
    }
});
