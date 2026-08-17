/*global QUnit*/

sap.ui.define([
	"cf/app/controller/Main1.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Main1 Controller");

	QUnit.test("I should test the Main1 controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
