  //TIMELINE
    var timeline = [];

    var stim_width_height = 200;
    var stim_padding = 40;
    var min_dot_density = 100;
    var max_dot_density = 2650;
    var min_line_density = 20;
    var max_line_density = 800;
    var correct_sound = new Audio("js/sound-correct.wav");
    var incorrect_sound = new Audio("js/sound-incorrect.wav");
    //  array of pair types for each trial in a given trial block
    var pair_types = [];
    var trial_blocks = 0; // number of trial blocks completed
    var max_dist = 0.33;
    var small_dot = 0.33;
    var medium_dot = 0.33;
    var large_dot = 0.33;
    var small_line = 0.33;
    var medium_line = 0.33;
    var large_line = 0.33;
    var trial_type = "successive";
    var trials = 0;
    var dot_reversals = 0;
    var line_reversals = 0;
    var dot_jnd = 0;
    var line_jnd = 0;
    var dist1d, dist2d, dist3d, dist4d;
    var dist1l, dist2l, dist3l, dist4l;

    // randomize distance
    function get_distance(distance) {
      distance = max_dist - ((max_dist - 0.2) * Math.random());
      return distance;
    }

    // determines which distance to use for given pair type
    function which_distance(pair_type) {
      var distance;
      switch(pair_type){
        case "small dot": distance = small_dot; break;
        case "medium dot": distance = medium_dot; break;
        case "large dot": distance = large_dot; break;
        case "small line": distance = small_line; break;
        case "medium line": distance = medium_line; break;
        case "large line": distance = large_line; break;
      }
      return distance;
    }

    // randomly determines which pair to present of given pair type
    function which_pair(distance) {
      var first, second, third, fourth;
      switch (distance) {
        case "small dot": first = [1, 5], second = [2, 6], third = [3, 7], fourth = [4, 8]; break;
        case "medium dot": first = [5, 9], second = [6, 10], third = [7, 11], fourth = [8, 12]; break;
        case "large dot": first = [9, 13], second = [10, 14], third = [11, 15], fourth = [12, 16]; break;
        case "small line": first = [1, 2], second = [5, 6], third = [9, 10], fourth = [13, 14]; break;
        case "medium line": first = [2, 3], second = [6, 7], third = [10, 11], fourth = [14, 15]; break;
        default: first = [3, 4], second = [7, 8], third = [11, 12], fourth = [15, 16]; break;

      }
      return jsPsych.randomization.sampleWithoutReplacement([first, second, third, fourth], 1)[0];
    }

    // returns an array of dimension values for a sunburst
    function stim_dim_val(sunburst) {
      var dot_dim, line_dim;
      var dot_anchor = Math.random() * (1 - (small_dot + medium_dot + large_dot));
      var line_anchor = Math.random() * (1 - (small_line + medium_line + large_line));
      // calculating dot dimension value for given sunburst
      if (sunburst <= 4) {dot_dim = dot_anchor}
      else if (sunburst <= 8) {dot_dim = dot_anchor + small_dot}
      else if (sunburst <= 12) {dot_dim = dot_anchor + small_dot + medium_dot}
      else {dot_dim = dot_anchor + small_dot + medium_dot + large_dot}
      // calculating line dimension value for given sunburst
      if (sunburst % 4 == 1) {line_dim = line_anchor}
      else if (sunburst % 4 == 2) {line_dim = line_anchor + small_line}
      else if (sunburst % 4 == 3) {line_dim = line_anchor + small_line + medium_line}
      else {line_dim = line_anchor + small_line + medium_line + large_line}
      var set = [dot_dim, line_dim];
      return set;
    }

    // randomly generates true or false
    function boolean() {return jsPsych.randomization.sampleWithoutReplacement([true, false], 1)[0];}

    // draws individual sunburst
    function generate_stim_svg(dot_dim, line_dim) {
        // params
        var w = stim_width_height;
        var r = stim_width_height/4;
        var x = w / 2;
        var y = w / 2;
        var circle_r = stim_width_height / 200;
        var minLineLength = 70;
        var dot_density = min_dot_density + (max_dot_density-min_dot_density)*dot_dim;
        var line_density = min_line_density + (max_line_density-min_line_density)*line_dim;

        // svg string
        var str = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + w + '">'

        //Code for drawing the lines that come out of the circle.
        //Each line starts in the center of the circle and is drawn outward
        for (var i = 0; i < line_density; i++) {
          var angle = Math.random() * Math.PI / 2;
          var lineLength = r + minLineLength + (r - minLineLength) * Math.random();
          var x2 = Math.cos(angle) * lineLength;
          var y2 = Math.sin(angle) * lineLength;
          if (Math.random() < 0.5) {
            x2 = -x2;
          }
          if (Math.random() < 0.5) {
            y2 = -y2;
          }
          x2 = x + x2;
          y2 = y + y2;
          str += '<line x1="' + x + '" y1="' + y + '" x2="' + x2 + '" y2="' + y2 + '" style="stroke:rgb(65,105,225); stroke-width:1;" />';
        }

        // draw circle
        str += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" style="stroke:rgb(65,105,225); stroke-width:2; fill: rgb(255,255,255);"/>'

        //Code for creating and dispersing the dots
        for (var j = 0; j < dot_density; j++) {
          do {
            var x2 = Math.random() * 2 * r + x - r;
            var y2 = Math.random() * 2 * r + y - r;
          } while ((Math.pow(x - x2, 2) + Math.pow(y - y2, 2)) > Math.pow(r - circle_r - 2, 2));
          str += '<circle cx="' + x2 + '" cy="' + y2 + '" r="' + circle_r + '" style="fill:rgb(65,105,225);" />';
        }

        str += "</svg>";

        return str;
    }

    function generate_stim(dot_dim, line_dim) {
        // params
        var w = 250;
        var r = 60;
        var x = w / 2;
        var y = w / 2;
        var circle_r = 1;
        var minLineLength = 70;
        var dot_density = min_dot_density + (max_dot_density-min_dot_density)*dot_dim;
        var line_density = min_line_density + (max_line_density-min_line_density)*line_dim;

        var canvas = document.createElement('canvas');
        canvas.width = w + 10;
        canvas.height = w + 10;
        var ctx = canvas.getContext('2d');
        ctx.strokeStyle = "#4169e1"

        //Code for drawing the lines that come out of the circle.
        //Each line starts in the center of the circle and is drawn outward
        for (var i = 0; i < line_density; i++) {
          var angle = Math.random() * Math.PI / 2;
          var lineLength = 50 + minLineLength + (50 - minLineLength) * Math.random();
          var x2 = Math.cos(angle) * lineLength;
          var y2 = Math.sin(angle) * lineLength;
          if (Math.random() < 0.5) {
            x2 = -x2;
          }
          if (Math.random() < 0.5) {
            y2 = -y2;
          }
          x2 = x + x2;
          y2 = y + y2;
          //str += '<line x1="' + x + '" y1="' + y + '" x2="' + x2 + '" y2="' + y2 + '" style="stroke:rgb(65,105,225); stroke-width:1;" />';
          ctx.beginPath();
          ctx.moveTo(x,y);
          ctx.lineTo(x2,y2);
          ctx.stroke();
        }

        // draw circle
        ctx.fillStyle="#FFFFFF";
        ctx.beginPath();
        ctx.arc(x,y,r,0,2*Math.PI);
        ctx.fill();
        ctx.stroke();
        //Code for creating and dispersing the dots
        ctx.fillStyle="#4169e1";
        for (var j = 0; j < dot_density; j++) {
          do {
            var x2 = Math.random() * 2 * r + x - r;
            var y2 = Math.random() * 2 * r + y - r;
          } while ((Math.pow(x - x2, 2) + Math.pow(y - y2, 2)) > Math.pow(r - circle_r - 2, 2));
          ctx.beginPath();
          ctx.arc(x2,y2,circle_r,0,2*Math.PI);
          ctx.fill();
        }
      var html = "<img src='"+canvas.toDataURL()+"'></img>";
      return html;
    }

    function hide_stim() {
        // params
        var dot_dim = 0.0;
        var line_dim = 0.0;
        var w = 250;
        var r = stim_width_height/4;
        var x = w / 2;
        var y = w / 2;
        var circle_r = stim_width_height / 200;
        var minLineLength = 70;
        var dot_density = min_dot_density + (max_dot_density-min_dot_density)*dot_dim;
        var line_density = min_line_density + (max_line_density-min_line_density)*line_dim;

        var canvas = document.createElement('canvas');
        canvas.width = w + 10;
        canvas.height = w + 10;
        var ctx = canvas.getContext('2d');
        ctx.strokeStyle = "#FFFFFF"

        //Code for drawing the lines that come out of the circle.
        //Each line starts in the center of the circle and is drawn outward
        for (var i = 0; i < line_density; i++) {
          var angle = Math.random() * Math.PI / 2;
          var lineLength = r + minLineLength + (r - minLineLength) * Math.random();
          var x2 = Math.cos(angle) * lineLength;
          var y2 = Math.sin(angle) * lineLength;
          if (Math.random() < 0.5) {
            x2 = -x2;
          }
          if (Math.random() < 0.5) {
            y2 = -y2;
          }
          x2 = x + x2;
          y2 = y + y2;
          //str += '<line x1="' + x + '" y1="' + y + '" x2="' + x2 + '" y2="' + y2 + '" style="stroke:rgb(65,105,225); stroke-width:1;" />';
          ctx.beginPath();
          ctx.moveTo(x,y);
          ctx.lineTo(x2,y2);
          ctx.stroke();
        }

        // draw circle
        ctx.fillStyle="#FFFFFF";
        ctx.beginPath();
        ctx.arc(x,y,r,0,2*Math.PI);
        ctx.fill();
        ctx.stroke();
        //Code for creating and dispersing the dots
        ctx.fillStyle="#FFFFFF";
        for (var j = 0; j < dot_density; j++) {
          do {
            var x2 = Math.random() * 2 * r + x - r;
            var y2 = Math.random() * 2 * r + y - r;
          } while ((Math.pow(x - x2, 2) + Math.pow(y - y2, 2)) > Math.pow(r - circle_r - 2, 2));
          ctx.beginPath();
          ctx.arc(x2,y2,circle_r,0,2*Math.PI);
          ctx.fill();
        }
      var html = "<img src='"+canvas.toDataURL()+"'></img>";
      return html;
    }

    var pause = {
      type: 'html-keyboard-response',
      stimulus: function () {
        if (jsPsych.data.get().last(2).values()[0].test_part != 'NR') {
          if (jsPsych.data.get().last(2).values()[0].key_press == null) {
            return "<p>Still with us? Press any key to continue. </p>";
          } else {return ''}
        } else {return ''}
      },
      trial_duration: function () {
        if (jsPsych.data.get().last(2).values()[0].test_part != 'NR') {
          if (jsPsych.data.get().last(2).values()[0].key_press != null) {
            return 250;
          }
        } else {return 250;}
      },
      on_start: function () {
        var bar_fill = ((trials) / 35) * 100;
        document.querySelector('#jspsych-progressbar-inner').style.width = bar_fill + '%';
      },
      data: {
        test_part: 'NR',
      },
    }

    var test = {
      type: 'html-keyboard-response',
      stimulus: '',
      choices: ['A', 'B'],
      trial_duration: 1000,
      on_start: function(trial) {
        trials += 1;
        var correct = jsPsych.randomization.sampleWithoutReplacement(['A', 'B'], 1)[0];
        if(pair_types.length == 0) {pair_types = jsPsych.randomization.shuffle(["small dot", "medium dot", "large dot", "small line", "medium line", "large line", "atn chk"])}
        var pair_type = pair_types.pop();
        if (pair_type == "atn chk") {
          var bool = boolean();
          var a = bool ? generate_stim(0.1, 0.1) : generate_stim(0.9, 0.9);
          var b = bool ? generate_stim(0.9, 0.9) : generate_stim(0.1, 0.1);
          if (correct == 'A'){var x = a}
          else /* (correct == 'B') */ {var x = b}
        }
        else {
          var bool = boolean();
          var distance =  which_distance(pair_type), pair = which_pair(pair_type);
          var ay = bool ? pair[0] : pair[1], bee = bool ? pair[1] : pair[0];
          var a_dot = stim_dim_val(ay)[0], a_line = stim_dim_val(ay)[1];
          var b_dot = stim_dim_val(bee)[0], b_line = stim_dim_val(bee)[1];
          var a = generate_stim(a_dot, a_line);
          var b = generate_stim(b_dot, b_line);
          if (correct == 'A'){var x = generate_stim(a_dot, a_line)}
          else /* (correct == 'B') */ {var x = generate_stim(b_dot, b_line)}
        }
        var stim = '<div id = "target" style="position: relative; width:600px; height:600px;">';
        if (correct == 'A'){
          stim += '<div id ="x">'+x+'</div>' +
            '<div class= "stim" id ="A">'+a+'</div>' +
            '<div class= "stim" id ="B">'+b+'</div>';
        } else /* (correct == 'B') */ {
          stim += '<div id ="x">'+x+'</div>' +
            '<div class= "stim" id ="A">'+a+'</div>' +
            '<div class= "stim" id ="B">'+b+'</div>';
        }
        stim += '</div>';
        var question = '<div class="center"><p>Choose the identical sunburst.</p></div>';
        trial.stimulus = stim + question;
        trial.data = {
          test_part: 'XAB',
          correct_response: correct,
          pair_type: pair_type,
          distance: distance,
          x_stim: x,
          a_stim: a,
          b_stim: b,
          a_dot: a_dot,
          a_line: a_line,
          b_dot: b_dot,
          b_line: b_line,
        }
      },
      on_finish: function(data) {
        if (data.correct_response == 'A') {data.correct = data.key_press == 65;}
        if (data.correct_response == 'B') {data.correct = data.key_press == 66;}
        //data.correct = data.key_press == jsPsych.pluginAPI.convertKeyCharacterToKeyCode(data.correct_response);
      },
    }

    var x = {
      type: 'html-keyboard-response',
      stimulus: '',
      choices: jsPsych.NO_KEYS,
      trial_duration: 1000,
      on_start: function(trial) {
        trials += 1;
        var correct = jsPsych.randomization.sampleWithoutReplacement(['A', 'B'], 1)[0];
        if(pair_types.length == 0) {pair_types = jsPsych.randomization.shuffle(["small dot", "medium dot", "large dot", "small line", "medium line", "large line", "atn chk"])}
        var pair_type = pair_types.pop();
        if (pair_type == "atn chk") {
          var bool = boolean();
          var a = bool ? generate_stim(0.1, 0.1) : generate_stim(0.9, 0.9);
          var b = bool ? generate_stim(0.9, 0.9) : generate_stim(0.1, 0.1);
          if (correct == 'A') {var x = a}
          else /* (correct == 'B') */ {var x = b}
        }
        else {
          var bool = boolean();
          var distance =  which_distance(pair_type), pair = which_pair(pair_type);
          var ay = bool ? pair[0] : pair[1], bee = bool ? pair[1] : pair[0];
          var a_dot = stim_dim_val(ay)[0], a_line = stim_dim_val(ay)[1];
          var b_dot = stim_dim_val(bee)[0], b_line = stim_dim_val(bee)[1];
          var a = generate_stim(a_dot, a_line);
          var b = generate_stim(b_dot, b_line);
          if (correct == 'A') {var x = generate_stim(a_dot, a_line)}
          else /* (correct == 'B') */ {var x = generate_stim(b_dot, b_line)}
        }
        var stim = '<div id = "target" style="position: relative; width:600px; height:550px;">';
        if (correct == 'A'){
          stim += '<div id ="x">'+x+'</div>' +
            '<div class= "stim" id ="A">'+hide_stim()+'</div>' +
            '<div class= "stim" id ="B">'+hide_stim()+'</div>';
        } else /* (correct == 'B') */ {
          stim += '<div id ="x">'+x+'</div>' +
            '<div class= "stim" id ="A">'+hide_stim()+'</div>' +
            '<div class= "stim" id ="B">'+hide_stim()+'</div>';
        }
        stim += '</div>';
        var question = '<div class="center"><p>Choose the identical sunburst.</p></div>';
        trial.stimulus = stim + question;
        trial.data = {
          test_part: 'X',
          correct_response: correct,
          pair_type: pair_type,
          distance: distance,
          a_stim: a,
          b_stim: b,
          a_dot: a_dot,
          a_line: a_line,
          b_dot: b_dot,
          b_line: b_line,
        }
      },
    }

    var blank = {
      type: 'html-keyboard-response',
      stimulus: '<div id = "target" style="position: relative; width:600px; height:550px;">' +
        '<div id ="x">'+hide_stim()+'</div>' +
        '<div class= "stim" id ="A">'+hide_stim()+'</div>' +
        '<div class= "stim" id ="B">'+hide_stim()+'</div>' +
        '</div><div class="center"><p>Choose the identical sunburst.</p></div>',
      choices: jsPsych.NO_KEYS,
      trial_duration: 1000,
      data: {test_part: 'blank'}
    }

    var ab = {
      type: 'html-keyboard-response',
      stimulus: '',
      choices: ['A','B'],
      trial_duration: 1000,
      on_start: function(trial) {
        var a = jsPsych.data.get().filter({test_part: 'X',}).last(1).values()[0].a_stim;
        var b = jsPsych.data.get().filter({test_part: 'X',}).last(1).values()[0].b_stim;
        var stim = '<div id = "target" style="position: relative; width:600px; height:550px;">'+
          '<div id ="x">'+hide_stim()+'</div>' +
          '<div class= "stim" id ="A">'+a+'</div>' +
          '<div class= "stim" id ="B">'+b+'</div></div>';
        var question = '<div class="center"><p>Choose the identical sunburst.</p></div>';
        trial.stimulus = stim + question;
        trial.data = {
          test_part: 'XAB',
          correct_response: jsPsych.data.get().filter({test_part: 'X',}).last(1).values()[0].correct_response,
          dimension: jsPsych.data.get().filter({test_part: 'X',}).last(1).values()[0].dimension,
          distance: jsPsych.data.get().filter({test_part: 'X',}).last(1).values()[0].distance,
          a_stim: a,
          b_stim: b,
          a_dot: jsPsych.data.get().filter({test_part: 'X',}).last(1).values()[0].a_dot,
          a_line: jsPsych.data.get().filter({test_part: 'X',}).last(1).values()[0].a_line,
          b_dot: jsPsych.data.get().filter({test_part: 'X',}).last(1).values()[0].b_dot,
          b_line:jsPsych.data.get().filter({test_part: 'X',}).last(1).values()[0].b_line,
        }
      },
      on_finish: function(data) {
        if (data.correct_response == 'A') {data.correct = data.key_press == 65;}
        if (data.correct_response == 'B') {data.correct = data.key_press == 66;}
        //data.correct = data.key_press == jsPsych.pluginAPI.convertKeyCharacterToKeyCode(data.correct_response);
      },
    }

    var successive_feedback = {
      type: "html-keyboard-response",
      stimulus: '',
      choices: jsPsych.NO_KEYS,
      trial_duration: 1000,
      on_start: function(trial) {
        //response data
        var lastCorrect = jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].correct;
        var correctResponse = jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].correct_response;
        if (jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].key_press == 65) {var actualResponse = 'A'}
        else if (jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].key_press == 66) {var actualResponse = 'B'}
        else {var actualResponse = null}
        var too_slow = jsPsych.randomization.sampleWithoutReplacement(['Snooze ya lose', 'Oops', 'Too Slow'], 1)[0];
        var stim = '<div id = "target" style="position: relative; width:600px; height:550px;">'+'<div id ="x">'+hide_stim()+'</div>';
        //determine what kind of feedback
        if (lastCorrect == true && actualResponse == 'A') {
          correct_sound.play();
          stim += '<div class= "correct" id ="A">'+ jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].a_stim + '</div>' +
            '<div class= "stim" id ="B">'+ jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].b_stim + '</div>' +
            '</div><div class= "center"><p>Correct!</p></div>';
        } else if (lastCorrect == true && actualResponse == 'B') {
          correct_sound.play();
          stim += '<div class= "stim" id ="A">'+ jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].a_stim + '</div>' +
            '<div class= "correct" id ="B">'+ jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].b_stim + '</div>' +
            '</div><div class= "center"><p>Correct!</p></div>';
        } else if (lastCorrect == false && actualResponse == 'A') {
          incorrect_sound.play();
          stim += '<div class= "incorrect" id ="A">'+ jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].a_stim + '</div>' +
            '<div class= "correct" id ="B">'+ jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].b_stim + '</div>' +
            '</div><div class= "center"><p>Incorrect!</p></div>';
        } else if (lastCorrect == false && actualResponse == 'B') {
          incorrect_sound.play();
          stim += '<div class= "correct" id ="A">'+ jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].a_stim + '</div>' +
            '<div class= "incorrect" id ="B">'+ jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].b_stim + '</div>' +
            '</div><div class= "center"><p>Incorrect!</p></div>';
        } else if (lastCorrect == false && actualResponse == null && correctResponse == 'A') {
          incorrect_sound.play();
          stim += '<div class= "incorrect" id ="A">'+ jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].a_stim + '</div>' +
            '<div class= "stim" id ="B">'+ jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].b_stim + '</div>' +
            '</div><div class= "center"><p>'+too_slow+'!</p></div>';
        } else /* (lastCorrect == false && actualResponse == null && correctResponse == 'B') */ {
          incorrect_sound.play();
          stim += '<div class= "stim" id ="A">'+ jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].a_stim + '</div>' +
            '<div class= "incorrect" id ="B">'+ jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].b_stim + '</div>' +
            '</div><div class= "center"><p></p>'+too_slow+'!</p></div>';
        }
        stim +=
        trial.stimulus = stim;
      },
      data: {test_part: 'NR'},
    }

    var simultaneous_feedback = {
      type: "html-keyboard-response",
      stimulus: '',
      choices: jsPsych.NO_KEYS,
      trial_duration: 1000,
      on_start: function(trial) {
        //response data
        var lastCorrect = jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].correct;
        var correctResponse = jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].correct_response;
        if (jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].key_press == 65) {var actualResponse = 'A'}
        else if (jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].key_press == 66) {var actualResponse = 'B'}
        else {var actualResponse = null}
        var too_slow = jsPsych.randomization.sampleWithoutReplacement(['Snooze ya lose', 'Oops', 'Too Slow'], 1)[0];
        var stim = '<div id = "target" style="position: relative; width:600px; height:550px;">';
        //determine what kind of feedback
        if (lastCorrect == true && actualResponse == 'A') {
          correct_sound.play();
          stim += '<div id ="x">' + jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].x_stim + '</div>' +
            '<div class= "correct" id ="A">'+ jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].a_stim + '</div>' +
            '<div class= "stim" id ="B">'+ jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].b_stim + '</div>' +
            '</div><div class= "center"><p>Correct!</p></div>';
        } else if (lastCorrect == true && actualResponse == 'B') {
          correct_sound.play();
          stim += '<div id ="x">' + jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].x_stim + '</div>' +
            '<div class= "stim" id ="A">'+ jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].a_stim + '</div>' +
            '<div class= "correct" id ="B">'+ jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].b_stim + '</div>' +
            '</div><div class= "center"><p>Correct!</p></div>';
        } else if (lastCorrect == false && actualResponse == 'A') {
          incorrect_sound.play();
          stim += '<div id ="x">' + jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].x_stim + '</div>' +
            '<div class= "incorrect" id ="A">'+ jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].a_stim + '</div>' +
            '<div class= "correct" id ="B">'+ jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].b_stim + '</div>' +
            '</div><div class= "center"><p>Incorrect!</p></div>';
        } else if (lastCorrect == false && actualResponse == 'B') {
          incorrect_sound.play();
          stim += '<div id ="x">' + jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].x_stim + '</div>' +
            '<div class= "correct" id ="A">'+ jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].a_stim + '</div>' +
            '<div class= "incorrect" id ="B">'+ jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].b_stim + '</div>' +
            '</div><div class= "center"><p>Incorrect!</p></div>';
        } else if (lastCorrect == false && actualResponse == null && correctResponse == 'A') {
          incorrect_sound.play();
          stim += '<div id ="x">' + jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].x_stim + '</div>' +
            '<div class= "incorrect" id ="A">'+ jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].a_stim + '</div>' +
            '<div class= "stim" id ="B">'+ jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].b_stim + '</div>' +
            '</div><div class= "center"><p>'+too_slow+'!</p></div>';
        } else /* (lastCorrect == false && actualResponse == null && correctResponse == 'B') */ {
          incorrect_sound.play();
          stim += '<div id ="x">' + jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].x_stim + '</div>' +
            '<div class= "stim" id ="A">'+ jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].a_stim + '</div>' +
            '<div class= "incorrect" id ="B">'+ jsPsych.data.get().filter({test_part: 'XAB',}).last(1).values()[0].b_stim + '</div>' +
            '</div><div class= "center"><p></p>'+too_slow+'!</p></div>';
        }
        stim +=
        trial.stimulus = stim;
      },
      data: {test_part: 'NR'},
    }

    var consent_form = {
      type: "html-button-response",
      stimulus: "<p>This experiment is being conducted by researchers at Vassar College.</p> \
      <p>It consists of a task which involves viewing various stimuli and making simple judgments about them.</p> \
      <p>The study takes approximately __ minutes to complete. </p> \
      <p>Participation poses minimal risk, meaning the risk is no greater than that of normal, everyday activities. </p> \
      <p>Your anonymous data, identified only by your Prolific worker ID, will be used for research purposes. </p> \
      <p>For your participation, you will receive a small payment of $_ upon completion of the experiment. </p> \
      <p>You are free to stop the experiment by closing your browser window at any time. </p> \
      <p>If you have any questions, you can contact the researchers through Prolific's messaging system.</p> \
      <p>By clicking 'I agree,' you affirm that you are at least 18 years of age, which is the minimum age to participate in this study.</p>",
      choices: ['I AGREE'],
    }

    var overview = {
      type: "html-button-response",
      choices: ["CONTINUE"],
      stimulus: "<p>Welcome to the experiment! </p> \
      <p>This study involves making speeded perceptual judgments about presented stimuli.</p> \
      <p>We will acquaint you with the task before you begin. As you get better at the tasks, they will become increasingly difficult!</p> \
      <p>Please ensure that you are able to devote your full attention to the tasks and do your best to answer correctly.</p> \
      <p>If you are unable to do so, we strongly encourage you not to continue with the experiment. </p> \
      <p>Please make sure your sound volume is set at a comfortable level and close all other browser windows.</p> \
      <p>If you wish to partake in the experiment, press 'continue'! Otherwise, please close your browser window now.</p>",
      data: {test_part: 'NR'}
    }

    var instruct = {
      type: "html-button-response",
      choices: ['CONTINUE'],
      stimulus: "<p>These are the instructions.</p>",
      data: {test_part: 'NR'}
    }

    var last_remarks = {
      type: "html-button-response",
      choices: ['CONTINUE'],
      stimulus: "<p>You will have just <strong>1 second</strong> to enter your response, </p> \
      <p>and after that it will move on to the next trial, so please do your best to respond within that time!</p> \
      <p>During the experiment, a progress bar will appear at the top of the screen to indicate your completion. </p> \
      <p>Okay, you’re finally ready to start! Press 'Continue' to proceed.</p>",
      data: {test_part: 'NR'}
    };

    var instructions = {
      timeline: [consent_form, overview, instruct, last_remarks],
      data: {test_part: 'NR'}
    }
    timeline.push(instruct);

    var countdown = {
      timeline: [
        {
          type: 'html-keyboard-response',
          stimulus: "<div class='center';'><img src='img/three.png'></img>",
          trial_duration: 1000,
          choices: jsPsych.NO_KEYS,
          data: {test_part: 'NR'}
        },
        {
          type: 'html-keyboard-response',
          stimulus: "<div class='center';'><img src='img/two.png'></img>",
          trial_duration: 1000,
          choices: jsPsych.NO_KEYS,
          data: {test_part: 'NR'}
        },
        {
          type: 'html-keyboard-response',
          stimulus: "<div class='center';'><img src='img/one.png'></img>",
          trial_duration: 1000,
          choices: jsPsych.NO_KEYS,
          data: {test_part: 'NR'}
        }
      ],
      data: {test_part: 'NR'},
    }
    timeline.push(countdown);

    var simultaneous_trials = {
      timeline: [pause, test, simultaneous_feedback],
      repetitions: 7,
    }

    var successive_trials = {
      timeline: [pause, x, blank, ab, successive_feedback],
      repetitions: 7,
    }

    var distance_update = {
      type: 'html-keyboard-response',
      stimulus: "<p>Update Distances from Server</p>",
      trial_duration: 3000,
      data: {test_part: 'NR'},
      on_start: function() {
        if (jsPsych.data.get().filter({pair_type: "atn chk",}).last(1).values()[0].correct) {
          small_dot = get_distance(small_dot);
          medium_dot = get_distance(medium_dot);
          large_dot = get_distance(large_dot);
          small_line = get_distance(small_line);
          medium_line = get_distance(medium_line);
          large_line = get_distance(large_line);
        }
      }
    }

    var trial_block = {
      timeline: trial_type == "simultaneous" ? [simultaneous_trials, distance_update] : [successive_trials, distance_update],
      repetitions: 5,
    }
    timeline.push(trial_block);

    var post = {
      type: "html-keyboard-response",
      stimulus: "<p><img src='img/super.gif'></img></p>" +
      "<p>Excellent work back there! You've completed phase one. Press any key to continue on to phase two.</p>",
    }

    var break1 = {
      type: 'html-keyboard-response',
      stimulus: function() {
        var stim = "<p><img src='img/beach1.gif'></img></p>";
        var msg = "Here's your first opportunity to take a break and relax your eyes. Press any key to resume the experiment.";
        var stimulus = stim + msg;
        return stimulus;
      },
      data: {test_part: 'NR'}
    }

    var break2 = {
      type: 'html-keyboard-response',
      stimulus: function() {
        var stim = "<p><img src='img/hot_sun.gif'></img></p>";
        var msg = "Phew! You're on fire, keep up the good work. Press any key to resume the experiment.";
        var stimulus = stim + msg;
        return stimulus;
      },
      data: {test_part: 'NR'}
    }

    var break3 = {
      type: 'html-keyboard-response',
      stimulus: function() {
        var stim = "<p><img src='img/root.gif'></img></p>";
        var msg = "You're almost there! Press any key to resume the experiment.";
        var stimulus = stim + msg;
        return stimulus;
      },
      data: {test_part: 'NR'}
    }

    //DEBRIEF
    var congrats = {
      type: 'html-keyboard-response',
      stimulus: "<p><img src='img/congrats.gif'></img></p> \
      <p>Well done, you made it! Press any key to continue.</p>",
    }
    timeline.push(pause);
    timeline.push(congrats);

    var debrief1 = {
      type: 'html-keyboard-response',
      stimulus: "<p>Thank you for participating in this experiment! Its purpose was to examine a phenomenon known as categorical perception.</p> \
      <p>In the first part with the odd-one-out task, we varied the amount by which the dots or the lines on odd one out differed from the rest </p> \
      <p>to see how small a difference you could reliably detect. When you got one right, we made the difference a little smaller, </p> \
      <p>and when you got one wrong, we made the difference a little larger. Press any key to continue.</p>",
      data: {test_part: 'debrief'},
    }

    var debrief2 = {
      type: 'html-keyboard-response',
      stimulus: "<p>This process continued in the second phase but alternating with another task.</p> \
        <p>For one group of subjects, the other task involved learning to categorize the sunbursts into two types </p> \
        <p>while another group was asked to make judgments about the number of dots or lines in a single sunburst.</p> \
        <p>We are interested in whether performance on the odd-one-out task was influenced by learning to categorize the sunbursts, </p> \
        <p>compared to making number judgments about them. For example, will people who learn to categorize the sunbursts </p> \
        <p>become more proficient on the oddball task when the oddball is in a different category? Press any key to continue. </p>",
      data: {test_part: 'debrief'},
    }

    var survey = {
      type: "survey-text",
      preamble: "<p>Your data will be kept anonymous! After answering the questions below, click CONTINUE to confirm you have completed the experiment. </p>",
      button_label: ["CONTINUE"],
      questions: [
        {prompt: "Did you follow the instructions to the best of your abilities and put a reasonable amount of effort into the experiment for the majority of the time? " +
        "If not, we do not want to use your data in our analysis, but you will still get paid for completing the experiment.  Thank you for your honesty!"},
        {prompt: "Were there any technical problems?"},
      ],
      on_finish: function(){
        serverComm.save_data(jsPsych.data.get().ignore('stimulus').values());
      },
    }

    var saving_data = {
      type: 'html-keyboard-response',
      stimulus: "<p>Saving your data. This will just take a few seconds.</p>",
      choices: jsPsych.NO_KEYS,
      trial_duration: 5000
    }

    var goodbye = {
      type: 'html-keyboard-response',
      stimulus: "<p>Thanks again for participating in our experiment!</p>" +
      "<p><a href='https://app.prolific.ac/submissions/complete?cc=ZQSEZJGY'>Click here to return to Prolific and complete the experiment.</a> " +
      "(You do not need a completion code)</p>",
      choices: jsPsych.NO_KEYS
    }

    // post-experiment debrief
    var debrief_block = {
      type: "html-keyboard-response",
      stimulus: function() {
        var ob_trials = jsPsych.data.get().filter({test_part: 'ob_test'});
        var ob_correct_trials = ob_trials.filter({correct: true});
        var ob_accuracy = Math.round(ob_correct_trials.count() / ob_trials.count() * 100);
        var ob_rt = Math.round(ob_correct_trials.select('rt').mean());
        if (group == 'experimental') {
          var ct_trials = jsPsych.data.get().filter({test_part: 'ct_test'});
          var ct_correct_trials = ct_trials.filter({correct: true});
          var ct_accuracy = Math.round(ct_correct_trials.count() / ct_trials.count() * 100);
          var ct_rt = Math.round(ct_correct_trials.select('rt').mean());
        } else {
          var nj_trials = jsPsych.data.get().filter({test_part: 'nj_test'});
          var nj_correct_trials = nj_trials.filter({correct: true});
          var nj_accuracy = Math.round(nj_correct_trials.count() / nj_trials.count() * 100);
          var nj_rt = Math.round(nj_correct_trials.select('rt').mean());
        }
        return "<p>You responded correctly on "+ob_accuracy+"% of the oddball trials.</p>"+
        "<p>Your average response time was "+ob_rt+"ms.</p>"+
        "<p>You responded correctly on "+ct_accuracy+"% of the single-item trials.</p>"+
        "<p>Your average response time was "+ct_rt+"ms.</p>"+
        "<p>Press any key to complete the experiment. Thank you!</p>";
      }
    };

    // start the experiment
    jsPsych.init({
      timeline: timeline,
      show_progress_bar: true,
      auto_update_progress_bar: false,
    });
