//form component
/*
  obj = {
    song: ,
    url: ,
    readonly: ,
    submitButton: ,
    formID:
  }
  song is object
  url is the url for post method
  readonly is a flag to set whether the input readonly or not
  submitButton is a flag to determine whether to show submit button at the bottom of the form or not
  formID is the id for differentiation all element in orisong form and translation form
*/
function songForm(obj) {
    var title = m.prop(obj.song.title)
    var author = m.prop(obj.song.author)
    var year = m.prop(obj.song.year)
    var lang = m.prop(obj.song.lang)
    var copyright = m.prop(obj.song.copyright)
    var lyric = obj.song.lyric;

    //copypaste stores the current data for copy and paste box
    var copypaste = []
    var errors = [];

    $(window).load(function() {
        //if the user wants to add a new song, show the modal for copy paste immediately on page load
        if (obj.song.title === '') {
            $('#copypaste' + obj.formID).modal('show');
        }
    });

    function addSong() {
        m.request({
                method: 'post',
                url: obj.url,
                data: {
                    title: title(),
                    author: author(),
                    year: year(),
                    lang: lang(),
                    copyright: copyright(),
                    lyric: lyric
                }
            })
            .then(function(res) {
                if (res.errorMessages) {
                    errors = res.errorMessages;
                    $('#alert').show().delay(2000).fadeOut()
                    $('body').scrollTop(0);
                } else {
                    window.location.href = res.url
                }
            })
    }
    var addStanza = {
        view: function(ctrl, args) {
            return m('.form-group', [
                m('label', 'Stanza ' + (args.index + 1) + ':'),
                m('textarea.form-control', {
                    value: function() {
                        return args.stanza.reduce((prev, curr) => {
                            return prev + '\n' + curr
                        })
                    }(),
                    rows: '5', //the default size of stanza textbox
                    config: function(elem, isInit) {
                        if (!isInit) {
                            if (obj.readonly) {
                                $(elem).prop('readonly', true)
                            }
                            $(elem).bind('input propertychange', function() {
                                //make an array of string
                                var newStanza = $(elem).val() ? $(elem).val().split(/\r?\n/) : ''
                                    //update the object
                                lyric.splice(args.index, 1, newStanza)
                            });
                        }
                    }
                }),
                m('button.btn.btn-default', {
                    disabled: args.length === 1 ? true : false,
                    onclick: function() {
                        lyric.splice(args.index, 1)
                    }
                }, [
                    m('span.glyphicon.glyphicon-minus')
                ]),
                m('button.btn.btn-default', {
                    onclick: function() {
                        lyric.splice(args.index + 1, 0, [''])
                    }
                }, [
                    m('span.glyphicon.glyphicon-plus')
                ])
            ])
        }
    }

    function copypasteModal() {
        return m('.modal.fade[role=dialog]', {
            id: 'copypaste' + obj.formID
        }, [
            m('.modal-dialog', [
                m('.modal-content', [
                    m('.modal-body', [
                        m('label', 'Lyrics:'),
                        m('textarea.form-control', {
                            rows: '25',
                            placeholder: 'Write the lyric with new line as a separator between stanzas',
                            config: function(elem, isInit) {
                                if (!isInit) {
                                    $(elem).bind('input propertychange', function() {
                                        copypaste = $(elem).val() ? $(elem).val().split(/\n\n|\/\//) : ''
                                        if (copypaste !== '') {
                                            copypaste = copypaste.map((cp) => {
                                                return cp.split(/\n|\//)
                                            })
                                        }
                                        console.log(JSON.stringify(copypaste[0]))
                                    });
                                }
                            }
                        }),
                        m('button.btn.btn-default', {
                            onclick: function() {
                                $('#copypaste' + obj.formID).modal('hide')
                                $('#copypaste' + obj.formID).find('textarea').val('')
                            }
                        }, 'Cancel'),
                        m('button.btn.btn-default', {
                            onclick: function() {
                                var isConfirmed = true;
                                $('#stanzas' + obj.formID).children().each(function() {
                                    if ($(this).find('textarea').val().replace(/\s/g, '') !== '') {
                                        isConfirmed = confirm('Do you want to overwrite your existing lyric ?')
                                        return;
                                    }
                                })
                                if (isConfirmed) {
                                    lyric = copypaste
                                    $('#copypaste' + obj.formID).modal('hide')
                                    $('#copypaste' + obj.formID).find('textarea').val('')
                                }
                            }
                        }, 'Done')
                    ])
                ])
            ])
        ])
    }

    function displayError() {
        if (!_.isEmpty(errors)) {
            return m('#alert.alert.alert-danger', {
                config: function(elem, isInit) {
                    if(!isInit){
                      $(elem).delay(3000).fadeOut()
                    }
                }
            }, [
                errors.map((error) => {
                    return m('p', error)
                })
            ])
        }
    }

    var songFormComponent = {
        view: function() {
            return [
                displayError(),
                m('div', {
                    style: {
                        'font-size': '15px'
                    }
                }, [
                    m('.form-group', [
                        m('label', 'Title'),
                        m('input.form-control', {
                            value: title(),
                            onchange: m.withAttr('value', title),
                            config: function(elem, isInit) {
                                if (!isInit) {
                                    if (obj.readonly) {
                                        $(elem).prop('readonly', true)
                                    }
                                }
                            }
                        })
                    ]),
                    m('.form-group', [
                        m('label', 'Author'),
                        m('input.form-control', {
                            value: author(),
                            onchange: m.withAttr('value', author),
                            config: function(elem, isInit) {
                                if (!isInit) {
                                    if (obj.readonly) {
                                        $(elem).prop('readonly', true)
                                    }
                                }
                            }
                        })
                    ]),
                    m('.form-group', [
                        m('label', 'Year Published'),
                        m('input.form-control', {
                            value: year(),
                            onchange: m.withAttr('value', year),
                            config: function(elem, isInit) {
                                if (!isInit) {
                                    if (obj.readonly) {
                                        $(elem).prop('readonly', true)
                                    }
                                }
                            }
                        })
                    ]),
                    m('.form-group', [
                        m('label', 'Language'),
                        m('select.form-control.capitalize', {
                            onchange: m.withAttr('value', lang),
                            config: function(elem, isInit) {
                                if (!isInit) {
                                    $(elem).val(lang())
                                    if (obj.readonly) {
                                        $(elem).prop('disabled', true)
                                    }
                                }
                            }
                        }, [
                            availableLanguages.map((lang) => {
                                return m('option', lang)
                            })
                        ])
                    ]),
                    m('.form-group', [
                        m('label', 'Copyright'),
                        m('select.form-control.capitalize', {
                            onchange: m.withAttr('value', copyright),
                            config: function(elem, isInit) {
                                if (!isInit) {
                                    $(elem).val(copyright())
                                    if (obj.readonly) {
                                        $(elem).prop('disabled', true)
                                    }
                                }
                            }
                        }, [
                            m('option', 'CC0'),
                            m('option', 'public'),
                            m('option', 'private')
                        ])
                    ]),
                    m('div', {
                        id: 'stanzas' + obj.formID
                    }, [
                        lyric.map((stanza, i, arr) => {
                            return m(addStanza, {
                                stanza: stanza,
                                index: i,
                                length: arr.length
                            })
                        })
                    ])
                ]),
                function() {
                    if (obj.submitButton) {
                        return m('button.btn.btn-primary', {
                            onclick: function() {
                                addSong()
                            }
                        }, 'Submit')
                    }
                }(),
                copypasteModal()
            ]
        }
    }
    return {
        songFormComponent: songFormComponent
    }
}
