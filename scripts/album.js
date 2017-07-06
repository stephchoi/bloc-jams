var createSongRow = function(songNumber, songName, songLength) {
  var template =
      '<tr class="album-view-song-item">'
    + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
    + '  <td class="song-item-title">' + songName + '</td>'
    + '  <td class="song-item-duration">' + songLength + '</td>'
    + '</tr>'
    ;

  var $row = $(template);

  var onHover = function(event) {
    var songNumberCell = $(this).find('.song-item-number');
    var songNumber = songNumberCell.attr('data-song-number');

    if (songNumber !== currentlyPlayingSongNumber) {
      songNumberCell.html(playButtonTemplate);
    }
  };

  var offHover = function(event) {
    var songNumberCell = $(this).find('.song-item-number');
    var songNumber = songNumberCell.attr('data-song-number');

    if (songNumber !== currentlyPlayingSongNumber) {
      songNumberCell.html(songNumber);
    }
  };

  var clickHandler = function(event) {
    var songNumber = $(this).attr('data-song-number');

    if (currentlyPlayingSongNumber !== null) {
      var currentlyPlayingCell = $('[data-song-number="' + currentlyPlayingSongNumber + '"]');
      currentlyPlayingCell.html(currentlyPlayingSongNumber);
    }
    if (currentlyPlayingSongNumber === songNumber) {
      $(this).html(playButtonTemplate);
      currentlyPlayingSongNumber = null;
      currentSongFromAlbum = null;
      $('.main-controls .play-pause').html(playerBarPlayButton);
    } else if (currentlyPlayingSongNumber !== songNumber) {
      $(this).html(pauseButtonTemplate);
      currentlyPlayingSongNumber = songNumber;
      currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
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
  currentlyPlayingSongNumber = songIndex + 1;
  currentSongFromAlbum = currentAlbum.songs[songIndex];
  updatePlayerBarSong();

  var lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');
  var nextSongNumberCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
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
  currentlyPlayingSongNumber = songIndex + 1;
  currentSongFromAlbum = currentAlbum.songs[songIndex];
  updatePlayerBarSong();

  var lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');
  var previousSongNumberCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
  previousSongNumberCell.html(pauseButtonTemplate);
  lastSongNumberCell.html(lastSongNumber);
};

var updatePlayerBarSong = function() {
  $('.currently-playing .song-name').text(currentSongFromAlbum.title);
  $('.currently-playing .artist-name').text(currentAlbum.artist);
  $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + ' - ' + currentAlbum.artist);

  $('.main-controls .play-pause').html(playerBarPauseButton);
};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;

$(document).ready(function() {
  setCurrentAlbum(albumPicasso);
});
