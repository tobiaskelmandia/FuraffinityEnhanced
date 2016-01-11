// ==UserScript==
// @name			Furaffinity Enhanced
// @namespace		http://codingtoby.com
// @version		0.4.0.3
// @description	Adds new features, fixes bugs, and more!
// @author		Toby
// @include		http://www.furaffinity.net/*
// @include		https://www.furaffinity.net/*
// @require		http://js.codingtoby.com/tusl.js?updated=00006
// @require		https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @require		https://cdnjs.cloudflare.com/ajax/libs/velocity/1.2.3/velocity.min.js
// @grant			GM_getValue
// @grant			GM_setValue
// @grant			GM_deleteValue
// ==/UserScript==

(function (w, $)
{
	// FAE Proper
	var FAE =
	    {
		    name      : GM_info["script"]["name"],
		    version   : GM_info["script"]["version"],
		    myLocation: w.location.href,
		    on        : {},
		    fn        : {},
		    user      : {},
		    status    : {},
		    site      : {}
	    };

	FAE.site =
	{
		baseURL: FAE.myLocation.split(".net")[0] + ".net",
		view   : {prefix: "/view/"},
		search : {prefix: "/search/"}
	};

	var fae_styles = "";


	for (var key in FAE.site)
	{
		if (FAE.site.hasOwnProperty(key))
		{
			var obj = FAE.site[key];
			for (var prop in obj)
			{
				if (obj.hasOwnProperty(prop))
				{
					// Create Full URLs.
					obj["url"] = FAE.site.baseURL + obj[prop];

					// Perform location checking.
					if (obj["prefix"])
					{

						if (RegExp(FAE.site.baseURL + obj["prefix"] + "*").exec(FAE.myLocation))
						{
							FAE.on[key] = true;
						}
						else
						{
							FAE.on[key] = false;
						}
					}
				}
			}
		}
	}


	FAE.fn =
	{
		scrollToPic : function()
		{
			var scrollTo = $(".maintable").position().top;
			scrollTo -= 5;
			$('html, body').animate({scrollTop: scrollTo}, 0);
		},

		gdocStories : function()
		{
			var gdocBase = "https://docs.google.com/viewer?url=";
			var api = "http://faexport.boothale.net/submission/";

			var temp = FAE.myLocation;
			var thisID = temp.replace(FAE.site.view.url,"");
			thisID = thisID.replace("/","");
			var apiURL = api + thisID + ".json";

			var test = $("td:contains('Submission information')").find("b:contains('Category')");
			var category = $(test[0]).prop("nextSibling").data;
			category = category.trim();

			if(category == "Story")
			{
				var dlURL = $("a:contains('Download')").attr("href");
				dlURL = "http:" + dlURL;
				var eDU = encodeURI(dlURL);
				var viewURL = gdocBase + eDU;
				$("a:contains('Download')").after(' | <a target="_blank" href="'+viewURL+'">GDocs</a>');
			}
		},

		responsivePic : function()
		{
			$("table[width*='%']").each(function()
			{
				var thisWidth = $(this).attr("width");
				$(this).removeAttr("width");
				$(this).css("width",thisWidth);
			});

			var winH = $(window).height();

			var mt = $(".maintable")[0];
			$("#submissionImg").before("<div id='fae_responsiveSubContainer'></div>");
			var temp = $("#submissionImg").prop("outerHTML");
			$("#submissionImg").remove();
			var mtW = $("#page-submission").width();
			$("#fae_responsiveSubContainer").append(temp);
			var actualType = $("#submissionImg").prop("nodeName");

			if(actualType == "IMG")
			{
				var imgW = $("#submissionImg").width();
				var responsiveImgWidth = mtW - 10;
				fae_styles += " .fae_responsiveSub { width: 100%; height: auto; box-sizing: border-box; } ";
				$("#fae_responsiveSubContainer").css("width",responsiveImgWidth);

				if(imgW >= mtW)
				{
					$("#submissionImg").addClass("fae_responsiveSub");
					$("#submissionImg").removeAttr("onclick");
					$("#submissionImg").click(function()
					{
						$("#submissionImg").toggleClass("fae_responsiveSub");
					});

					$(w).resize(function()
					{
						$("#submissionImg").hide();
						var mtW = $("#page-submission").width();
						$("#submissionImg").show();
						var responsiveImgWidth = mtW - 10;
						$("#fae_responsiveSubContainer").css("width",responsiveImgWidth);
						console.log("window resized");
					});
				}
			}
			else if(actualType == "SPAN")
			{
				var objW = $("object").width();
				var objH = $("object").height();
				var objOriginalW = objW;
				var objOriginalH = objH;
				var responsiveObjWidth = "";
				var responsiveObjHeight = "";
				var useScale = false;

				var scrollTo = $("object").position().top;
				scrollTo -= 5;
				$('html, body').animate({scrollTop: scrollTo}, 0);

				function findScale()
				{
					objW = $("object").width();
					objH = $("object").height();
					winH = $(window).height();
					mtW = $("#page-submission").width();

					if((objW >= mtW) && (objH < winH))
					{
						responsiveObjWidth = mtW - 10;
						var objWdiff = responsiveObjWidth / objW;
						responsiveObjHeight = objWdiff * objH;

						useScale = objWdiff;
					}
					else if((objH >= winH) && (objW < mtW))
					{
						var reduceH = objH - winH;
						responsiveObjHeight = (objH - reduceH) - 10;
						var objHdiff = responsiveObjHeight / objH;
						responsiveObjWidth = (objHdiff * objW);

						$("#fae_responsiveSubContainer").css("width",responsiveObjWidth);
						$("#fae_responsiveSubContainer").css("height",responsiveObjHeight);

						useScale = objHdiff;
					}
					else if ((objH >= winH) && (objW >= mtW))
					{
						var reduceH = objH - winH;
						var reduceW = objW - mtW;

						var newObjH = objH - reduceH;
						var newObjW = objW - reduceW;

						var scaleH = newObjH / objH;
						var scaleW = newObjW / objW;

						if(scaleH < scaleW)
						{
							responsiveObjWidth = (objW * scaleH) - 10;
							responsiveObjHeight = (objH * scaleH) - 10;
							useScale = scaleH;
						}
						else
						{
							responsiveObjWidth = objW * scaleW;
							responsiveObjHeight = objH * scaleW;
							useScale = scaleW;
						}
					}
				}

				function makeAdjustments()
				{
					findScale();
					if(useScale)
					{
						$("object").attr("width",responsiveObjWidth);
						$("object").attr("height",responsiveObjHeight);
					}
				}
				makeAdjustments();

				$(w).resize(function()
				{
					$("object").attr("width",objOriginalW);
					$("object").attr("height",objOriginalH);
					makeAdjustments();
				});

			}

		},

		instaFav    : function ()
		{
			$(document).ready(function ()
			{

				var addText     = "+Add to Favorites";
				var remText     = "-Remove from Favorites";
				var addFavLink  = $("a:contains('" + addText + "')")[0];
				var remFavLink  = $("a:contains('" + remText + "')")[0];
				var thisLink    = "";
				var linkURL     = "";
				var currentText = "";


				if ((typeof addFavLink !== "undefined") && (typeof remFavLink !== "undefined"))
				{
					console.log("No link.");
				}
				else
				{
					if (typeof addFavLink !== "undefined")
					{
						thisLink    = $("a:contains('" + addText + "')")[0];
						linkURL     = FAE.site.baseURL + $(addFavLink).attr("href");
						currentText = addText;
					}
					if (typeof remFavLink !== "undefined")
					{
						thisLink    = $("a:contains('" + remText + "')")[0];
						linkURL     = FAE.site.baseURL + $(remFavLink).attr("href");
						currentText = remText;
					}
					$(thisLink).attr("href", "javascript:;");

					$(thisLink).click(function ()
					{
						toggleLink(thisLink, linkURL);
					});
				}

				function gotoLink(linkURL)
				{
					var dfd = jQuery.Deferred();
					$.ajax(
						{
							method : "GET",
							url    : linkURL,
							success: function (data)
							{
								dataType: 'html',
									dfd.resolve();
							},
							error  : function ()
							{
								alert("Error faving.");
							}
						});
					return dfd.promise();
				}


				function toggleLink(thisLink, linkURL)
				{
					$.when(gotoLink(linkURL)).then(function ()
					{
						if (currentText == addText)
						{
							currentText = remText;
						}
						else
						{
							currentText = addText;
						}
						$(thisLink).text(currentText);
						console.log("Success.");
					});
				}
			});
		},
		betterSearch: function ()
		{
			$(document).ready(function ()
			{
				$("#search-form").prop("method", "GET");
				$("select[name='perpage']").val("72");
				$("input[type='submit']").each(function()
				{
					$(this).attr("type","button");
				});

				function fae_search()
				{
					$("input[type='checkbox']").each(function()
					{
						if(!$(this).prop("checked"))
						{
							$(this).after('<input type="hidden" name="'+$(this).attr("name")+'" value="0">');
						}
					});
					$("#search-form").submit();
				}

				$("input[name='do_search']").click(function()
				{
					fae_search();
				});
				$("#q").keydown(function(e)
				{
					if(e.which == 13)
					{
						fae_search();
					}
				});
				$("input[name='next_page']").click(function()
				{
					var page = w.location.search.substr(1).split("&")[1];
					curPage = page.replace("page=","");
					curPage = parseInt(curPage);
					var nextPage = curPage+1;
					var newPage = "page="+nextPage;
					var loc = FAE.myLocation;
					var nextPageURL = loc.replace(page,newPage);
					w.location.href = nextPageURL;
				});
			});

			if (FAE.site.search.url == FAE.myLocation)
			{
				$(document).ready(function ()
				{
					$("#button-extended").click();
					var scrollTo = $(".maintable").position().top;
					scrollTo -= 5;
					$('html, body').animate({scrollTop: scrollTo}, 0);
					$("select[name='order-by']").val("popularity");
				});
			}
			else
			{
				$(document).ready(function ()
				{
					var nextPageButtons = $("input[name='next_page']");
					$(nextPageButtons[0]).attr("id", "nextPageTOP");
					$(nextPageButtons[1]).attr("id", "nextPageBOT");

					$("#search-results").find("a").each(function ()
					{
						var thisLinkURL = $(this).attr("href");
						var thisID      = thisLinkURL.replace("/view/","");
						thisID          = thisID.replace("/","");
						$(this).attr("id", thisID);
						var sro        = JSON.stringify({id: "sid_"+thisID});

						$(this).click(function (e)
						{
							e.preventDefault();
							history.replaceState(sro,$("title"),FAE.myLocation);
							w.location.href = $(this).attr("href");
						});
					});

					var searchPage = parseInt($("#page").val());
					var sr = $("legend:contains('Search results')").text();
					numResults = sr.split("of ")[1];
					numResults = numResults.split(")")[0];
					var numResults = parseInt(numResults);
					//console.log("Results: " + numResults);
					var pages = numResults / 72;
					pages = Math.ceil(pages);
					//console.log("Pages: " + pages);
					$("#page").after(" / <input type='text' size='3' class='textbox' disabled value='"+pages+"'> ");

					(function ()
					{
						$("input[name='do_search']").click(function()
						{
							var sro = JSON.stringify({ id : "search-results" });
							history.replaceState(sro,$("title"),FAE.myLocation);
						});

						if($("#nextPageTOP").val() != ">>> 72 more >>>")
						{
							var curPage = parseInt($("#page").val());
							var resultsLeft = numResults - (curPage * 72);
							var newVal = ">>> " + resultsLeft + " more >>>";
							$("#nextPageTOP").val(newVal);
							$("#nextPageBOT").val(newVal);
						}

						$("#nextPageTOP").click(function ()
						{
							var sro = JSON.stringify({ id : "nextPageTOP" });
							history.replaceState(sro,$("title"),FAE.myLocation);
						});

						$("#nextPageBOT").click(function ()
						{
							var sro = JSON.stringify({ id : "nextPageBOT" });
							history.replaceState(sro,$("title"),FAE.myLocation);
						});
					})();


					if(history.state)
					{
						var hs = JSON.parse(history.state);
						var id = hs.id;
						var scrollTo = $("#" + id).position().top;
						$('html, body').animate({scrollTop: scrollTo}, 0);

						if(id.indexOf("sid_") != -1)
						{
							$("#" + id).css("background-color","#2e3b41");
							$("#" + id)
								.velocity({backgroundColor: "#4F5F67"})
								.velocity({backgroundColor: "#2e3b41"})
								.velocity({backgroundColor: "#4F5F67"})
								.velocity({backgroundColor: "#2e3b41"});
						}
					}
					else
					{
						var scrollTo = $("#search-results").position().top;
						scrollTo -= 5;
						$('html, body').animate({scrollTop: scrollTo}, 0);
					}

					var query = w.location.search.substr(1).split("&")[0];
					query     = query.replace("q=", "");
					query     = tusl.replaceAll(query, "+", " ");
					query     = tusl.replaceAll(query, "%2B", "+");
					$("#q").val(query);
				});
			}
		}
	};

	FAE.init = function()
	{
		$(document).ready(function()
		{
			$("head").append("<style id='fae_styles'>"+fae_styles+"</style>");
		});

		if (FAE.on.view)
		{
			FAE.fn.instaFav();
			FAE.fn.scrollToPic();
			FAE.fn.responsivePic();
			FAE.fn.gdocStories();
		}
		else if (FAE.on.search)
		{
			FAE.fn.betterSearch();
		}
	};

	var tempLoc = w.location.href;
	if(tempLoc.indexOf("furaffinity.net") != -1)
	{
		FAE.init();
	}

})(window, this.jQuery);