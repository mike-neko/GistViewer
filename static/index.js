new Vue({
    el: '#gist',

    data: {
        user: {
            name: "",
            url: ""
        },
        gists: [],
        detail: null
    },

    created: function () {
        this.fetchAll();
    },

    methods: {
        fetchAll: function () {
            var self = this;
            axios.get('/all')
                .then(function (response) {
                    self.user = response.data.user;
                    self.gists = response.data.gists;
                    self.detail = response.data.detail;
                });
        // FIXME: error
        },

        clickList: function (e) {
            console.log(e);
            var ele = e.target;
            while (ele.tagName.toUpperCase() !== 'LI' && ele != null) {
                ele = ele.parentNode;
            }

            if (ele != null) {
                this.fetchItem(ele.attributes[0].value)
            }
        },

        fetchItem: function (id) {
            var self = this;
            axios.get('/item', {
                params: {
                    id: id,
                }
            }).then(function (response) {
                self.detail = response.data;
            });
            // FIXME: error
        }
    }
});
