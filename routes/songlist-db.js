var express = require('express'),
    router = express.Router(),
    Song = require('../models/song'),
    User = require('../models/user'),
    helperFunc = require('../lib/helperFunc'),
    Language = require('../models/language')


// router.use('/', isAdminLoggedIn, function(req, res, next, next){
//   next()
// })

router.get('/', function(req, res, next) {
    Song.find(function(err, songs) {
        if (err) return next(err);
        res.render('songlist-db', {
            songs: songs
        })
    })
})

router.get('/add', function(req, res, next) {
    Language.find(function(err, languages) {
        if (err) next(err)
        res.render('add', {
            availableLanguages: languages.map((language) => language.lang),
            song: {
                title: '',
                author: '',
                year: '',
                lang: 'english',
                copyright: 'CC0',
                lyric: [
                    ['']
                ]
            }
        })
    })

})

router.post('/add', function(req, res, next) {
    req.checkBody('title', 'Title is empty').notEmpty()
    req.checkBody('author', 'Author is empty').notEmpty()
    req.checkBody('year', 'Year is empty').notEmpty()
    var errors = req.validationErrors()
    if (errors) {
        res.send({
            errorMessages: errors.map((error) => error.msg)
        })
    } else {
        var data = req.body
        Song.findOne({
            title: data.title
        }, function(err, song) {
            if (err) {
                res.status(400).send('error ' + err)
            }
            if (song) {
                res.send({
                    errorMessages: ['Song Exists']
                });
            } else {
                var newSong = new Song({
                    title: data.title,
                    author: data.author,
                    year: data.year,
                    lang: data.lang,
                    lyric: data.lyric,
                    contributor: req.user.username,
                    copyright: data.copyright,
                    timeAdded: Date.now()
                })
                newSong.save(function(err) {
                    if (err) {
                        res.status(400).send('error saving new song ' + err)
                    } else if (data.copyright === 'private') {
                        User.findById(req.user._id, function(err, user) {
                            console.log(user)
                            console.log(newSong._id)
                            user.library.push(newSong._id)
                            user.save(function(err) {
                                if (err) next(err)
                                res.send({
                                    url: '/user/library'
                                })
                            })
                        })
                    } else {
                        res.send({
                            url: '/user/library'
                        })
                    }
                })
            }
        })
    }
})

router.delete('/:song_id', function(req, res, next) {
    Song.remove({
        _id: req.params.song_id
    }, function(err) {
        if (err) return next(err)
        res.send()
    })
})

router.route('/:song_id/edit')
    .all(function(req, res, next) {
        song_id = req.params.song_id
        song = {}
        Song.findById(song_id, function(err, s) {
            song = s
            next()
        })
    })
    .get(function(req, res, next) {
        Language.find(function(err, languages) {
            if (err) next(err)
            res.render('edit', {
                availableLanguages: languages.map((language) => language.lang),
                song: song
            })
        })
    })
    .post(function(req, res, next) {
        req.checkBody('title', 'Title is empty').notEmpty()
        req.checkBody('author', 'Author is empty').notEmpty()
        req.checkBody('year', 'Year is empty').notEmpty()
        var errors = req.validationErrors()
        if (errors) {
            res.send({
                errorMessages: errors.map((error) => error.msg)
            })
        } else {
            var data = req.body
            song.title = data.title
            song.author = data.author
            song.year = data.year
            song.lang = data.lang
            song.copyright = data.copyright
            song.lyric = data.lyric
            song.save(function(err) {
                if (err) {
                    res.status(400).send('Error editing the song: ' + error)
                } else {
                    res.send({
                        url: '/songlist-db'
                    })
                }
            })
        }
    })

module.exports = router;
