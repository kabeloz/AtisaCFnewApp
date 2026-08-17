sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment"
], (Controller, JSONModel, Fragment) => {
    "use strict";

    return Controller.extend("cf.app.controller.Main1", {
        onInit: function () {

            var oChartModel = new JSONModel("model/Chart.json");
            this.getView().setModel(oChartModel, "chart");

            var oSummaryModel = new JSONModel("model/Summary.json");
            this.getView().setModel(oSummaryModel, "summary");

            var oPracticeModel = new JSONModel("model/Practice.json");
            this.getView().setModel(oPracticeModel, "practice");

            var oThirdPartyModel = new JSONModel("model/ThirdParty.json");
            this.getView().setModel(oThirdPartyModel, "thirdParty");

            // Chart configuration 
            var oVizFrame = this.byId("pieChart1");
            if (oVizFrame) {
                oVizFrame.setVizProperties({
                    title: {
                        visible: false
                    },
                    legend: {
                        visible: true
                    },
                    interaction: {
                        selectability: {
                            mode: "single"
                        }
                    },
                    plotArea: {
                        colorPalette: [
                            "#1976D2", // My Employers
                            "#FB8C00", // Services Rendered
                            "#26A69A", // New Claims
                            "#7CB342", // Approved
                            "#D32F2F", // Active Claims
                            "#8E44AD", // Pending Claims
                            "#16A085"  // Claims Status
                        ],
                        dataLabel: {
                            visible: true,
                            type: "colorAndPercentage",
                            hideWhenOverlap: false,

                        }
                    }
                });
            } else {
                console.error("pieChart1 not found");
            }


            var oChart = this.byId("summaryBarChart");
            oChart.setVizProperties({
                title: {
                    visible: false
                },

                legend: {
                    visible: true
                },
                plotArea: {
                    colorPalette: [

                        "#97c8fa", // My Claims
                        "#2981f5", // Payments
                        "#0745a3", // Medical Reports
                        "#D32F2F"  // Notification
                    ],
                    gap: {
                        barSpacing: 0.10
                    },
                    dataLabel: {
                        visible: true
                    }
                },
                valueAxis: {
                    title: {
                        visible: false
                    }
                },
                categoryAxis: {
                    title: {
                        visible: false
                    }
                }
            });
            const fnCreateDashboard = function () {

                var oData = oChartModel.getData();
                var oSummary = oSummaryModel.getData();
                var aThirdParty = oThirdPartyModel.getProperty("/items") || [];

                if (!oData.items || !oSummary.items || !oThirdPartyModel.getProperty("/items")) {
                    return;
                }
                var iTotalActiveClaims = aThirdParty.reduce(function (sum, item) {
                    return sum + Number(item.Active_Claims);
                }, 0);

                var iTotalIndividualClaims = oSummary.items.reduce(function (sum, item) {
                    return sum + Number(item.Value);
                }, 0);

                var iEmployers = Number(oData.items[0].ClaimCount);
                var iActiveClaims = Number(oData.items[1].ClaimCount);
                var iNewClaims = Number(oData.items[2].ClaimCount);
                var iClaimStatus = Number(oData.items[3].ClaimCount);
                var iIndividualClaims = Number(oData.items[4].ClaimCount);

                this.getView().setModel(new JSONModel({
                    Total:
                        iEmployers +
                        iActiveClaims +
                        iNewClaims +
                        iClaimStatus +
                        iIndividualClaims,

                    Employers: iEmployers,

                    ActiveClaims: iActiveClaims,

                    NewClaims: iNewClaims,

                    ClaimStatus: iClaimStatus,

                    IndividualClaims: iIndividualClaims,

                    LastUpdated: oData.items[0].LastUpdated
                }), "dashboard");

            }.bind(this);


            oChartModel.attachRequestCompleted(fnCreateDashboard);
            oSummaryModel.attachRequestCompleted(fnCreateDashboard);
            oThirdPartyModel.attachRequestCompleted(fnCreateDashboard);



            var oPracticeChart = this.byId("idVizFrame");

            oPracticeChart.setVizProperties({
                title: {
                    visible: false
                },

                legend: {
                    visible: false
                },

                plotArea: {
                    drawingEffect: "glossy",
                    dataLabel: {
                        visible: true
                    },

                    line: {
                        width: 4
                    },

                    marker: {
                        visible: true,
                        size: 10
                    },

                    colorPalette: [
                        "#1976D2",
                        "#43A047",
                        "#FB8C00"
                    ]
                },

                categoryAxis: {
                    title: {
                        visible: false
                    }
                },

                valueAxis: {
                    title: {
                        visible: false
                    },
                    gridline: {
                        visible: true
                    }
                }
            });


            oPracticeModel.attachRequestCompleted(function () {

                var aItems = oPracticeModel.getProperty("/items") || [];

                var iTotalPractices = aItems.reduce(function (sum, item) {
                    return sum + Number(item.Quantity);
                }, 0);

                oPracticeModel.setProperty("/TotalPractices", iTotalPractices);

            }.bind(this));
                

        },  // end of onInit 

        onAfterRendering: function () {

                this._removeTileTooltips("tileThirdParty");
                this._removeTileTooltips("tilePayments");
                this._removeTileTooltips("tileReports");

            },

            _removeTileTooltips: function (sTileId) {

                var oTile = this.byId(sTileId);

                if (oTile) {
                    oTile.setTooltip("");

                    // Remove native browser title attribute
                    oTile.$().removeAttr("title");

                    // Also remove title attributes from the tile's internal elements
                    oTile.$().find("[title]").removeAttr("title");
                }
            },

        onPieSelect: async function (oEvent) {

            var aData = oEvent.getParameter("data");

            if (!aData || !aData.length) {
                console.warn("No pie data selected.");
                return;
            }

            console.log("Pie selection:", aData);

            // Data returned by VizFrame
            var oSelectedData = aData[0].data;

            console.log("Selected data:", oSelectedData);

            // Your VizFrame gives us Category
            var sCategory = oSelectedData.Category;

            console.log("Selected Category:", sCategory);

            if (!sCategory) {
                console.error("Category was not found in selected data.");
                return;
            }

            // Get Chart model
            var oChartModel = this.getView().getModel("chart");

            if (!oChartModel) {
                console.error("Chart model 'chart' was not found.");
                return;
            }

            // Get all items
            var aItems = oChartModel.getProperty("/items") || [];

            console.log("Chart items:", aItems);

            // Find selected item
            var iIndex = aItems.findIndex(function (oItem) {
                return oItem.Category === sCategory;
            });

            if (iIndex === -1) {

                console.error(
                    "Could not find category:",
                    sCategory
                );

                return;
            }

            var oSelectedItem = aItems[iIndex];

            console.log(
                "Selected Chart Item:",
                oSelectedItem
            );

            // Load dialog only once
            if (!this._oPieDetails) {

                this._oPieDetails = await this.loadFragment({
                    name: "cf.app.fragment.PieDetails"
                });

                this.getView().addDependent(
                    this._oPieDetails
                );
            }

            // Bind dialog to selected item
            var iRow = oSelectedData._context_row_number;

            this._oPieDetails.bindElement({
                path: "/items/" + iRow,
                model: "chart"
            });

            // Open dialog
            this._oPieDetails.open();
        },

        onClosePieDetails: function () {
            this._oPieDetails.close();
        },

        BarChartSelect: async function (oEvent) {

            var sCategory = oEvent.getParameter("data")[0].data.Category;

            // Get the full summary model
            var aItems = this.getView().getModel("summary").getProperty("/items");

            // Find the selected object
            var oSelected = aItems.find(function (item) {
                return item.Category === sCategory;
            });

            // Load fragment only once
            if (!this._oBarChartDialog) {
                this._oBarChartDialog = await sap.ui.core.Fragment.load({
                    id: this.getView().getId(),
                    name: "cf.app.fragment.BarChart",
                    controller: this
                });

                this.getView().addDependent(this._oBarChartDialog);
            }

            this._oBarChartDialog.setModel(
                new sap.ui.model.json.JSONModel(oSelected),
                "details"
            );

            this._oBarChartDialog.open();
        },
        onBarChart: function () {
            this._oBarChartDialog.close();


        },

        onItemPress: async function (oEvent) {

            var oItem = oEvent.getParameter("listItem");

            if (!oItem) {
                console.error("No list item was selected.");
                return;
            }

            // Get the route from <core:CustomData>
            var sRoute = oItem.data("route");

            console.log("Selected item:", oItem.getTitle());
            console.log("Route:", sRoute);

            if (!sRoute) {
                console.error("No route defined for:", oItem.getTitle());
                return;
            }

            var sTitle = oItem.getTitle();

            // Show loading dialog
            await this._showLoading(" Please wait " + sTitle + "is Loading  ");

            // Navigate
            this.getOwnerComponent()
                .getRouter()
                .navTo(sRoute);
        },


        _showLoading: async function (sMessage) {

            if (!this._oLoadingDialog) {

                this._oLoadingDialog = await this.loadFragment({
                    name: "cf.app.fragment.Loading"
                });

                this.getView().addDependent(this._oLoadingDialog);
            }

            Fragment.byId(
                this.getView().getId(),
                "loadingText"
            ).setText(sMessage);

            this._oLoadingDialog.open();

            return new Promise(function (resolve) {

                setTimeout(function () {

                    this._oLoadingDialog.close();

                    resolve();

                }.bind(this), 700);

            }.bind(this));
        },

        onThirdParty: async function () {

            await this._showLoading("Loading Third Party Users...");

            this.getOwnerComponent()
                .getRouter()
                .navTo("RouteMain2");
        },
        onPayments: async function () {

            await this._showLoading("Loading Individual Claims...");

            this.getOwnerComponent()
                .getRouter()
                .navTo("RouteMain3");
        },
        onRegisterdPractices: async function () {

            await this._showLoading("Loading Registered Practices MFP...");

            this.getOwnerComponent()
                .getRouter()
                .navTo("RouteMain4");
        },
        showClaimSection: function (sCategory) {
            return sCategory === "My Claims" ||
                sCategory === "Payments";
        },
        showMedicalSection: function (sCategory) {
            return sCategory === "Medical Reports";
        },
        showNotificationSection: function (sCategory) {
            return sCategory === "Notifications";
        },

        showFinancialSection: function (sCategory) {
            return sCategory === "My Claims" ||
                sCategory === "Payments";
        },

        formatClaimStatus: function (sStatus) {
            switch (sStatus) {
                case "Approved":
                    return "Success";

                case "Pending":
                    return "Warning";

                case "Rejected":
                    return "Error";

                case "In Progress":
                    return "Information";

                default:
                    return "None";
            }
        },

        formatAssessmentStatus: function (sStatus) {
            switch (sStatus) {
                case "Completed":
                    return "Success";

                case "Pending":
                    return "Warning";

                case "Failed":
                    return "Error";

                default:
                    return "None";
            }
        },

        formatAdjudicationStatus: function (sStatus) {
            switch (sStatus) {
                case "Approved":
                    return "Success";

                case "Pending":
                    return "Warning";

                case "Rejected":
                    return "Error";

                default:
                    return "None";
            }
        },

        formatPaymentStatus: function (sStatus) {
            switch (sStatus) {
                case "Paid":
                    return "Success";

                case "Partially Paid":
                    return "Warning";

                case "Not Processed":
                    return "Information";

                case "Not Applicable":
                    return "None";

                default:
                    return "None";
            }
        },

        formatCompleteStatus: function (sComplete) {
            switch (sComplete) {
                case "Complete":
                    return "Success";

                case "In Progress":
                    return "Warning";

                case "Not Complete":
                    return "None";

                default:
                    return "None";
            }
        },

        formatStageStatus: function (sStatus) {
            switch (sStatus) {
                case "Passed":
                    return "Success";

                case "Pending":
                    return "Warning";

                case "Failed":
                    return "Error";

                default:
                    return "None";
            }
        },



    });
});