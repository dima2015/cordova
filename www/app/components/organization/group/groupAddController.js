(function () {

    var controller = function ($scope) {

        var c = this;

        var selectMemberListener = function(){
            jQuery(".lapalaa li").bind('touchend click', function(){
                var elem = jQuery(this);
                var checkmark = elem.find('md-icon');
                var id = elem.attr('id');
                var index = c.selectedMembers.indexOf(id);
                if(index !== -1){
                    checkmark.removeAttr('style');
                    c.selectedMembers.splice(index,1);
                    console.log(c.selectedMembers)
                }
                else{
                    checkmark.css('display','block');
                    c.selectedMembers.push(id);
                    console.log(c.selectedMembers)
                }
            })
        };
        c.selectedMembers = [];
        selectMemberListener();
    };

    var app = angular.module('Plunner');
    app.controller('groupAddController', ['$scope', controller]);
}());
