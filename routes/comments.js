var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// NEW
router.get("/new", middleware.isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
       if (err) {
           console.log(err);
       } else {
           res.render("comments/new", {campground: campground});
       }
    });
});

// CREATE
router.post("/", middleware.isLoggedIn,  (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, (err, comment) => {
                if (err) {
                    console.log(err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment._id); 
                    campground.save((err, savedCampground) => {
                        if (err) {
                            console.log(err);
                        } else {
                            req.flash("success", "Successfully added a comment");
                            res.redirect("/campgrounds/" + req.params.id);
                        }
                    });                 
                }
            });
        }
    });
});


// EDIT
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundComment) => {
        if (err || !foundComment) {
            req.flash("error", "Campground not found");
            res.redirect("back");
            console.log("test");
        }
        Comment.findById(req.params.comment_id, (err, comment) => {
            if (err) {
                res.redirect("back");
            } else {
                res.render("comments/edit", {campground_id: req.params.id, comment: comment});
            }
        });
    });
});

// UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
      if (err) {
          res.redirect("back");
      } else {
          res.redirect("/campgrounds/" + req.params.id);
      }
  })
});

// DESTROY
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, err => {
        if (err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});

module.exports = router;