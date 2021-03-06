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
        const lang = this.language || 'text';
        this.editor.session.setMode('ace/mode/' + lang.toLowerCase());
        this.editor.$blockScrolling = Infinity;

        var self = this;
        this.editor.on('change', function () {
            var value = self.editor.getValue();
            self.$emit('update:content', value);
            self.$emit('change', value);
            self.beforeContent = value;
        });
    },

    watch: {
        'content': function (value) {
            if (this.beforeContent !== value) {
                this.editor.setValue(value, 1);
            }
        },

        'language': function (value) {
            const lang = value || 'text';
            this.editor.session.setMode('ace/mode/' + lang.toLowerCase());
        },
    },

});

new Vue({
    el: '#gist',

    data: {
        user: {
            name: '',
            url: '',
            avatarUrl: '',
        },
        gists: [],

        detail: null,

        selectedId: '',
        isEdited: false,
        initialDetail: null,
    },

    computed: {
        dateString: function () {
            if (this.detail) {
                var create = moment(this.detail.createdDate);
                var update = moment(this.detail.updatedDate);
                return 'Created: ' + create.format('YYYY-M-D HH:mm')
                    + ' / Updated: ' + update.fromNow();
            } else {
                return '';
            }
        },
        canFileDelete: function () {
            return this.detail.files.length > 1
        },
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
                self.setDetail(response.data);

                var ele = window.document.getElementById("gist-detail");
                if (ele) {
                    ele.scrollTo(0, 0);
                }
            });
            // FIXME: error
        },

        newItem: function () {
            // TODO: 編集中チェック
            this.detail = {
                new: true,
                summary: '',
                public: true,
                files: [{
                    name: '',
                    content: '',
                }],
                id: '',
            };

            this.setDetail(this.detail);
        },

        deleteItem: function () {
            var self = this;
            axios.delete('/item/' + this.detail.id)
                .then(function (response) {
                    self.detail = null;
                });
            // FIXME: error
            // TODO: リスト更新
        },

        addFile: function () {
            this.detail.files.push({
                name: '',
                content: '',
            });
            this.isEdited = true;
        },

        deleteFile: function (index) {
            var name = this.detail.files[index].beforeName;
            if (name) {
                this.detail.deleteFiles.push(name);
            }
            this.detail.files.splice(index, 1);
            this.isEdited = true;
        },

        update: function () {
            var self = this;
            var files = {};
            this.detail.files.forEach(
                function (file) {
                    var d = {
                        content: file.content,
                    };
                    var before = file.beforeName || '';
                    if (before == '') {
                        files[file.name] = d;
                    } else {
                        if (before != file.name) {
                            d['filename'] = file.name;
                        }
                        files[before] = d;
                    }
                }
            );

            this.detail.deleteFiles.forEach(
                function (name) {
                    files[name] = null;
                }
            );

            axios.patch('/item/' + this.detail.id, {
                description: self.detail.summary,
                files: files,
            }).then(function (response) {
                self.setDetail(response.data);
            });

            // TODO: リスト更新
        },

        create: function (isPublic) {
            var self = this;
            var files = {};
            this.detail.files.forEach(
                function (file) {
                    files[file.name] = { content: file.content }
                }
            );

            axios.post('/item', {
                description: self.detail.summary,
                public: isPublic,
                files: files,
            }).then(function (response) {
                self.setDetail(response.data);
            });

            // TODO: リスト更新
        },

        setDetail: function (data) {
            data.files.forEach(
                function (file) {
                    file.beforeName = file.name;
                }
            );
            data.deleteFiles = [];
            this.detail = data;
            this.selectedId = data.id;
            this.isEdited = false;
            this.initialDetail = data;  // FIXME: copy
        },

        reset: function () {
            this.setDetail(this.initialDetail);
            this.isEdited = false;
        }
    }
});
