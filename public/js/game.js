function Game(socket) {
    var _io     = socket,
        _room   = null,
        _stage  = this.STAGE_INPUTNAME;

    var $roomList = $('#roomList');

    this.init = function() {
        this.goToStage(_stage);
    }

    this.listRooms = function() {
        $.get('/rooms', function(data) {
            var pattern = '<tr><td>%s</td><td>%s</td><td>%s</td><td><button data-action="join-room" data-param="%s" type="button" class="btn btn-default btn-xs">Entrar</button></td></tr>',
                newContent = '';
            if(data.length > 0) {
                $.each(data, function(i, row) {
                    var rowStr = pattern
                        .replace('%s', row.ref)
                        .replace('%s', row.name)
                        .replace('%s', row.count)
                        .replace('%s', row.ref);
                    newContent += rowStr;
                });
            } else {
                newContent = '<tr><td colspan="3">Nenhum campo disponível</td></tr>';
            }

            $roomList.html(newContent);
        });
    }

    this.newRoom = function(name) {
        $.post('/rooms', {name: name}, this.listRooms);
    }

    this.joinRoom = function(id) {
        _io.emit('join', {roomId: id});
    }

    this.inputPlayerName = function(name) {
        _io.emit('inputPlayerName', {playerName: name});
        Game.listRooms();
        Game.goToStage(this.STAGE_LISTROOMS);
    }

    this.goToStage = function(stageName) {
        $('.game-stage').hide();
        $('#' + stageName).show();
    }

    this.startGame = function(data) {
        var you = data.players.you;
        var other = data.players.other;
    }

    this.round = function(){
        _io.emit('roundPlayerAttack');
    }

    this.roomInfo = function(data) {
        $('#room-name').text(data.room.name);

        var you = data.players.you;
        var other = data.players.other;

        $('#player-'+(you.position+1)+'-name').text(you.player.name);

        if (other != null) {
            $('#player-'+(other.position+1)+'-name').text(other.player.name);

            $('#player-'+(you.position+1)+'-name').parent().find("span").text(you.player.hp);
            $('#player-'+(other.position+1)+'-name').parent().find("span").text(other.player.hp);

            $('#player-'+(you.position+1)+'-name').parent().find("p").show();
            $('#player-'+(other.position+1)+'-name').parent().find("p").hide();

            Game.startGame(data);
        } else {
            var pos = ((you.position+1) == 1) ? 2 : 1;
            $('#player-'+pos+'-name').text('( aguardando adversário )');
        }

        $('#stage-room').find("button").attr('disabled', 'disabled');
        $('#player-'+(data.room.currentPlayer + 1)+'-name').parent().find("button").removeAttr('disabled');
    }

    this.init();
}

Game.prototype.STAGE_INPUTNAME = 'stage-inputname';
Game.prototype.STAGE_LISTROOMS = 'stage-listrooms';
Game.prototype.STAGE_ROOM = 'stage-room';

