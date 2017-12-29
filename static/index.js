new Vue({
    el: '#gist-list',

    data: {
        gists: [
            {
                title: "hoge",
                summary: "summary",
                public: true,
            },
            {
                title: "hoge2",
                summary: "summary2",
                public: false,
            },
        ],
    },
});

new Vue({
    el: '#gist-detail',

    data: {
        title: "hoge2",
        files: [
            {
                name: "summary2",
                content: "ssss",
            },
            {
                name: "summary3",
                content: "sssse",
            },
            {
                name: "summary3",
                content: "sssse",
            },
        ],
        public: false,
    },
});
