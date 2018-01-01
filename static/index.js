var editor_counter = 0;

Vue.component('editor', {
    template: '<div :id="counter" style="height: 600px">{{ content }}</div>',
    props: ['content', 'language'],

    data: function () {
        return {
            editor: null,
            beforeContent: '',
            counter: 'editor_' + editor_counter,
        }
    },

    created: function () {
        editor_counter += 1;
    },

    mounted: function () {
        this.editor = window.ace.edit(this.counter);
        this.editor.session.setMode('ace/mode/' + this.language);
        this.editor.$blockScrolling = Infinity;

        var self = this;
        this.editor.on('change', function () {
            self.beforeContent = self.editor.getValue();
            self.$emit('update:content', self.editor.getValue())
        });
    },

    watch: {
        'content' (value) {
            if (this.beforeContent !== value) {
                this.editor.setValue(value, 1);
            }
        }
    },

});

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
