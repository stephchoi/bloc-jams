var createSongRow = function(songNumber, songName, songLength) {
  var template =
      '<tr class="album-view-song-item">'
    + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
    + '  <td class="song-item-title">' + songName + '</td>'
    + '  <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
    + '</tr>'
    ;

  var $row = $(template);

  var onHover = function(event) {
    var songNumberCell = $(this).find('.song-item-number');
    var songNumber = parseInt(songNumberCell.attr('data-song-number'));

    if (songNumber !== currentlyPlayingSongNumber) {
      songNumberCell.html(playButtonTemplate);
    }
  };

  var offHover = function(event) {
    var songNumberCell = $(this).find('.song-item-number');
    var songNumber = parseInt(songNumberCell.attr('data-song-number'));

    if (songNumber !== currentlyPlayingSongNumber) {
      songNumberCell.html(songNumber);
    }
  };

  var clickHandler = function(event) {
    var songNumber = parseInt($(this).attr('data-song-number'));

    var $volumeBar = $('.player-bar .volume')
    $volumeBar.find('.fill').width(currentVolume + '%');
    $volumeBar.find('.thumb').css({left: currentVolume + '%'});

    if (currentlyPlayingSongNumber !== null) {
      var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
      currentlyPlayingCell.html(currentlyPlayingSongNumber);
    }
    if (currentlyPlayingSongNumber === songNumber) {
      if (currentSoundFile.isPaused()) {
        $('.main-controls .play-pause').html(playerBarPauseButton);
        $(this).html(pauseButtonTemplate);
        currentSoundFile.play();
        updateSeekBarWhileSongPlays();
      } else {
        $('.main-controls .play-pause').html(playerBarPlayButton);
        $(this).html(playButtonTemplate);
        currentSoundFile.pause();
      }

      $('.main-controls .play-pause').html(playerBarPlayButton);
    } else if (currentlyPlayingSongNumber !== songNumber) {
      $(this).html(pauseButtonTemplate);
      setSong(songNumber);
      currentSoundFile.play();
      updateSeekBarWhileSongPlays();
      updatePlayerBarSong();
    }
  };

  $row.find('.song-item-number').click(clickHandler);
  $row.hover(onHover, offHover);

  return $row;
};

var setCurrentAlbum = function(album) {
  currentAlbum = album;
  var $albumTitle = $('.album-view-title');
  var $albumArtist = $('.album-view-artist');
  var $albumReleaseInfo = $('.album-view-release-info');
  var $albumImage = $('.album-cover-art');
  var $albumSongList = $('.album-view-song-list');

  $albumTitle.text(album.title);
  $albumArtist.text(album.artist);
  $albumReleaseInfo.text(album.year + ' ' + album.label);
  $albumImage.attr('src', album.albumArtUrl);

  $albumSongList.empty();

  for (var i =0; i < album.songs.length; i++) {
    var $newRow = createSongRow(i +1, album.songs[i].title, album.songs[i].duration);
    $albumSongList.append($newRow);
  }
};

var updateSeekBarWhileSongPlays = function() {
  if(currentSoundFile) {
    currentSoundFile.bind('timeupdate', function(event) {
      var seekBarFillRatio = this.getTime() / this.getDuration();
      var $seekBar = $('.seek-control .seek-bar');
      var currentTime = filterTimeCode(this.getTime());

      setCurrentTimeInPlayerBar(currentTime);
      updateSeekPercentage($seekBar, seekBarFillRatio);
    });
  }
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
  var offsetXPercent = seekBarFillRatio * 100;
  offsetXPercent = Math.max(0, offsetXPercent);
  offsetXpercent = Math.min(100, offsetXPercent);

  var percentageString = offsetXpercent + '%';
  $seekBar.find('.fill').width(percentageString);
  $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function() {
  var $seekBars = $('.player-bar .seek-bar');

  $seekBars.click(function(event){
    var offsetX = event.pageX - $(this).offset().left;
    var barWidth = $(this).width();
    var seekBarFillRatio = offsetX / barWidth;
    if($(this).parent().attr('class') == 'seek-control') {
       seek(seekBarFillRatio * currentSoundFile.getDuration());
    } else {
       setVolume(seekBarFillRatio * 100);
    }
    updateSeekPercentage($(this), seekBarFillRatio);
  });

  $seekBars.find('.thumb').mousedown(function(event) {
    var $seekBar = $(this).parent();
    $(document).bind('mousemove.thumb', function(event) {
      var offsetX = event.pageX - $seekBar.offset().left;
      var barWidth = $seekBar.width();
      var seekBarFillRatio = offsetX / barWidth;

      if($seekBar.parent().attr('class') == 'seek-control') {
         seek(seekBarFillRatio * currentSoundFile.getDuration());
      } else {
         setVolume(seekBarFillRatio * 100);
      }

      updateSeekPercentage($seekBar, seekBarFillRatio)
    });

    $(document).bind('mouseup.thumb', function(){
      $(document).unbind('mousemove.thumb');
      $(document).unbind('mouseup.thumb');
    });
  });
};

var setSong = function(songNumber) {
  if(currentSoundFile) {
    currentSoundFile.stop();
  }

  currentlyPlayingSongNumber = parseInt(songNumber);
  currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
  currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
    formats:['mp3'],
    preload: true
  });

  setVolume(currentVolume);
};

var seek = function(time) {
  if(currentSoundFile) {
    currentSoundFile.setTime(time);
  }
};

var setCurrentTimeInPlayerBar = function(currentTime) {
  $('.seek-control .current-time').text(currentTime);
};

var setTotalTimeInPlayerBar = function(totalTime) {
  $('.seek-control .total-time').text(totalTime);
};

var setVolume = function(volume) {
  if(currentSoundFile) {
    currentSoundFile.setVolume(volume);
  }
};

var getSongNumberCell = function(number) {
  return $('.song-item-number[data-song-number="' + number + '"]');
};

var trackIndex = function(album, song) {
  return album.songs.indexOf(song);
};

var nextSong = function() {
  var songIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  songIndex++;

  if (songIndex >= currentAlbum.songs.length) {
    songIndex = 0;
  }

  var lastSongNumber = currentlyPlayingSongNumber;
  setSong(songIndex + 1);
  currentSoundFile.play();
  updateSeekBarWhileSongPlays();
  updatePlayerBarSong();

  var lastSongNumberCell = getSongNumberCell(lastSongNumber);
  var nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
  nextSongNumberCell.html(pauseButtonTemplate);
  lastSongNumberCell.html(lastSongNumber);
};

var previousSong = function() {
  var songIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  songIndex--;

  if (songIndex < 0) {
    songIndex = currentAlbum.songs.length - 1;
  }

  var lastSongNumber = currentlyPlayingSongNumber;
  setSong(songIndex + 1);
  currentSoundFile.play();
  updateSeekBarWhileSongPlays();
  updatePlayerBarSong();

  var lastSongNumberCell = getSongNumberCell(lastSongNumber);
  var previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
  previousSongNumberCell.html(pauseButtonTemplate);
  lastSongNumberCell.html(lastSongNumber);
};

var updatePlayerBarSong = function() {
  $('.currently-playing .song-name').text(currentSongFromAlbum.title);
  $('.currently-playing .artist-name').text(currentAlbum.artist);
  $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + ' - ' + currentAlbum.artist);

  var totalTime = currentAlbum.songs[currentlyPlayingSongNumber - 1].duration;
  totalTime = filterTimeCode(totalTime);
  setTotalTimeInPlayerBar(totalTime);

  $('.main-controls .play-pause').html(playerBarPauseButton);
};

var filterTimeCode = function(timeInSeconds) {
  var time = parseFloat(timeInSeconds);
  var wholeSeconds = Math.floor(time%60);
  if (wholeSeconds.toString().length < 2) {
    wholeSeconds = "0" + wholeSeconds;
  }
  var wholeMinutes = Math.floor(time/60);
  return wholeMinutes + ":" + wholeSeconds;
};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');

$(document).ready(function() {
  setCurrentAlbum(albumPicasso);
  setupSeekBars();
  $previousButton.click(previousSong);
  $nextButton.click(nextSong);
});
