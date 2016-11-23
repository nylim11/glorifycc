var playlistModal = (function() {
    var currentPlaylists = m.prop(playlists)
    var addPlaylist = function(name, playlistName, addButtonDOM) {
        m.request({
                method: 'PUT',
                url: '/user/library',
                data: {
                    name: name
                }
            })
            .then(function(res) {
                if (res.playlistExists) {
                    $('#info').show()
                        .delay(2000)
                        .fadeOut()
                } else {
                    currentPlaylists(res.playlists)
                    playlistName(name)
                    $('#newPlaylist').modal('hide')
                    addButtonDOM().trigger('click')
                }
            })
    }

    var addToPlaylist = (args) => {
        m.request({
                method: 'POST',
                url: '/user/library',
                data: {
                    name: args.playlistName(),
                    id: args.songID
                }
            })
            .then((res) => {
                args.label('Added to ' + args.playlistName());
                args.disabled(true);
                setTimeout(() => {
                    args.label('Add to Playlist');
                    args.disabled(false);
                    m.redraw()
                }, 3000);
            })
    }

    var enter = function(elem) {
        $(elem).keyup(function(e) {
            if (e.keyCode == 13) {
                $("#create").click()
            }
        })
    }

    function createNewPlaylist(args) {
        return m('.modal.fade[role=dialog]', {
            id: 'newPlaylist' + args.modalName
        }, [
            m('.modal-dialog.modal-sm', [
                m('.modal-content', [
                    m('.modal-header', [
                        m('h4', 'New Playlist')
                    ]),
                    m('.modal-body', [
                        m('label', 'Enter Playlist Name'),
                        m('input#newPlaylistInput.form-control[name=playlist type=text]', {
                            value: 'New Playlist',
                            config: function(elem, isInit) {
                                if (!isInit) {
                                    enter(elem)
                                }
                            }
                        }),
                        m('br'),
                        m('#info.alert-danger', {
                            style: {
                                display: 'none'
                            }
                        }, 'Playlist Exists'),
                        m('button#create.btn.btn-default#create', {
                            onclick: function() {
                                addPlaylist($('input#newPlaylistInput').val(), args.playlistName, args.addButtonDOM);
                            }
                        }, 'Create')
                    ])
                ])
            ])
        ])
    }

    function choosePlaylist(args) {
        return m('.modal.fade[role=dialog]', {
            id: 'choosePlaylist' + args.modalName
        }, [
            m('.modal-dialog.modal-sm', [
                m('.modal-content', [
                    m('.modal-header', [
                        m('h4', {
                            style: {
                                'margin-left': '40px'
                            }
                        }, 'Select Playlist', [
                            m('button#test.btn.btn-default.btn-sm.pull-right', {
                                'data-toggle': 'tooltip',
                                'data-placement': 'right',
                                title: 'Add New Playlist',
                                config: function(elem, isInit) {
                                    if (!isInit) {
                                        $(elem).tooltip()
                                    }
                                },
                                onclick: function() {
                                    $('#choosePlaylist' + args.modalName).modal('hide')
                                    $('#newPlaylist' + args.modalName).modal('show')
                                }
                            }, [
                                m('span.glyphicon.glyphicon-plus')
                            ])
                        ])
                    ]),
                    m('.modal-body', [
                        currentPlaylists().map((pl) => {
                            return [
                                m('p', [
                                    m('a', {
                                        href: '#',
                                        onclick: function() {
                                            args.playlistName(pl.name)
                                            console.log()
                                            args.addButtonDOM().trigger('click')
                                        },
                                        'data-dismiss': 'modal'
                                    }, pl.name)
                                ])
                            ]
                        })
                    ])
                ])
            ])
        ])
    }

    var playlistModalComponent = {
        view: function(ctrl, args) {
            return m('div', [
                choosePlaylist(args),
                createNewPlaylist(args)
            ])
        }
    }

    return {
        playlistModalComponent: playlistModalComponent,
        addToPlaylist: addToPlaylist
    }
})()