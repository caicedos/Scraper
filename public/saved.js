$.getJSON("/saved", function (data) {
  for (var i = 0; i < data.length; i++) {

    $("#articles").append(
      "<div class='col-sm-4' style='margin-bottom:60px;'><div class='card'><div class='card-body'><a class='title-link text-info' href='" + data[i].link + "'><h5>" + data[i].title + "</h5></a><hr><p class='card-text'>" + data[i].summary + "</p><button data-id='" + data[i]._id + "' class='btn-note btn btn-outline-info btn-sm' data-toggle='modal' data-target='#myModal' style='margin-right:10px;'>Note</button><button id='btn-delete' data-id='" + data[i]._id + "' class='btn btn-outline-danger btn-sm'>Delete</button></div></div></div>"
    );
  }
});

$(document).on("click", ".btn-note", function () {

  $(".modal-title").empty();
  $(".input").empty();

  var thisId = $(this).attr("data-id");

  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  }).done(function (data) {

    console.log(data);

    $(".modal-title").append("<h5>" + data.title + "</h5>");
    $(".input").append("<textarea id='bodyinput' name='body'></textarea>");
    $(".input").append("<button data-id='" + data._id + "' id='savenote' class='btn btn-info btn-sm' style='margin-top:20px;'data-dismiss='modal'>Save Note</button>");

    if (data.note) {
      $("#bodyinput").val(data.note.body);
    }
  });
});

$(document).on("click", "#savenote", function () {

  var thisId = $(this).attr("data-id");

  $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        body: $("#bodyinput").val()
      }
    })

    .done(function (data) {

      console.log(data);

    });

  $("#bodyinput").val("");

});


$(document).on("click", "#btn-delete", function () {

  var thisId = $(this).attr("data-id");
  console.log(thisId);

  $.ajax({
    method: "PUT",
    url: "/delete/" + thisId,
  }).done(function (data) {
    console.log(data);
    location.reload();
  });
});