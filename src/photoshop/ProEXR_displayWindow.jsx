#target photoshop

/*

<javascriptresource>
<name>ProEXR displayWindow</name>
<about>Part of ProEXR from fnord software^r^rResizes a document based on OpenEXR displayWindow.</about>
</javascriptresource>

*/

// by Brendan Bolles

// To install, place this file in {Photoshop Folder}/Presets/Scripts/
// Then open a file in Photoshop using ProEXR or ProEXR EZ and run the script from File > Scripts > ProEXR displayWindow

// For more background on this script, see
// http://fnordware.blogspot.com/2012/06/datawindow-and-displaywindow-in-openexr.html


function makeWindow()
{
	var window_start = [300, 300];
	var window_size = [450,150];

	var button_size = [100, 25];

	var window_bounds = [window_start[0],window_start[1],window_start[0] + window_size[0], window_start[1] + window_size[1]];

	var dlg = new Window('dialog', 'ProEXR displayWindow', window_bounds);
	dlg.margins = [20, 20, 10, 10];

	var ok_bounds = [window_size[0] - dlg.margins[2] - button_size[0], window_size[1] - dlg.margins[3] - button_size[1], window_size[0] - dlg.margins[2], window_size[1] - dlg.margins[3]];
	var cancel_bounds = [ok_bounds[0] - button_size[0] - dlg.margins[2], ok_bounds[1], ok_bounds[0] - dlg.margins[2], ok_bounds[3]];
	
	dlg.OKbutton = dlg.add('button', ok_bounds, 'OK');
	dlg.CancelButton = dlg.add('button', cancel_bounds, 'Cancel');
	
	var text_size = [100, 25];
	
	var dataWindow_bounds = [dlg.margins[0], dlg.margins[1] , dlg.margins[0] + text_size[0], dlg.margins[1] + text_size[1]];
	var displayWindow_bounds = [dataWindow_bounds[0], dataWindow_bounds[3] + dlg.margins[3], dataWindow_bounds[2], dataWindow_bounds[3] + dlg.margins[3] + text_size[1]];
	
	var dataWindow_label = dlg.add('statictext', dataWindow_bounds, 'dataWindow');
	var displayWindow_label = dlg.add('statictext', displayWindow_bounds, 'displayWindow');
	
	dataWindow_label.justify = 'right';
	displayWindow_label.justify = 'right';
	
	var field_size = [50, 25];
	
	dlg.dataWindowFields = new Array;
	dlg.displayWindowFields = new Array;
	
	for(var i=0; i < 4; i++)
	{
		var fieldUptick = 3;
		
		var data_bounds = [dataWindow_bounds[2] + dlg.margins[0] + (i * (field_size[0] + dlg.margins[0])), dataWindow_bounds[1] - fieldUptick, dataWindow_bounds[2] + dlg.margins[0] + (i * (field_size[0] + dlg.margins[0])) + field_size[0], dataWindow_bounds[3] - fieldUptick]
		var display_bounds = [data_bounds[0], displayWindow_bounds[1] - fieldUptick, data_bounds[2], displayWindow_bounds[3] - fieldUptick];
		
		dlg.dataWindowFields[i] = dlg.add('edittext', data_bounds);
		dlg.displayWindowFields[i] = dlg.add('edittext', display_bounds);
		
		dlg.dataWindowFields[i].justify = 'right';
		dlg.displayWindowFields[i].justify = 'right';
	}

	return dlg;
}


function parseBox2i(source_text, box_name)
{
	var exp_string = box_name + " \\(box2i\\): \\[(-?\\d+), (-?\\d+), (-?\\d+), (-?\\d+)\\]";
	
	var exp = new RegExp(exp_string, 'gi');
	
	var box_txt = source_text.match(exp);
	
	if(box_txt != undefined)
	{
		return [parseInt(box_txt[0].replace(exp, '$1'), 10),
					parseInt(box_txt[0].replace(exp, '$2'), 10),
					parseInt(box_txt[0].replace(exp, '$3'), 10),
					parseInt(box_txt[0].replace(exp, '$4'), 10)];
	}
	else
		return null;
}


function processWindows(dialog, doc)
{
	var expand_left = parseInt(dialog.dataWindowFields[0].text, 10) - parseInt(dialog.displayWindowFields[0].text, 10);
	var expand_top = parseInt(dialog.dataWindowFields[1].text, 10) - parseInt(dialog.displayWindowFields[1].text, 10);
	var expand_right = parseInt(dialog.displayWindowFields[2].text, 10) - parseInt(dialog.dataWindowFields[2].text, 10);
	var expand_bottom = parseInt(dialog.displayWindowFields[3].text, 10) - parseInt(dialog.dataWindowFields[3].text, 10);
	
	if(isNaN(expand_left) || isNaN(expand_top) || isNaN(expand_right) || isNaN(expand_bottom))
	{
		alert('Fields not entered properly.');
	}
	else if(expand_left == 0 && expand_top == 0 && expand_right == 0 && expand_left == 0)
	{
		alert('dataWindow and displayWindow are identical.');
	}
	else
	{
		var width = doc.width.as('px');
		var height = doc.height.as('px');
		
		var dw_width = 1 + parseInt(dialog.dataWindowFields[2].text, 10) - parseInt(dialog.dataWindowFields[0].text, 10);
		var dw_height = 1 + parseInt(dialog.dataWindowFields[3].text, 10) - parseInt(dialog.dataWindowFields[1].text, 10);
		
		if(width == dw_width && height == dw_height)
		{
			if(expand_left > expand_right)
			{
				if(expand_left != 0)
					doc.resizeCanvas(UnitValue(width + expand_left, 'px'), doc.height, AnchorPosition.MIDDLERIGHT);
					
				width = doc.width.as('px');
				
				if(expand_right != 0)
					doc.resizeCanvas(UnitValue(width + expand_right, 'px'), doc.height, AnchorPosition.MIDDLELEFT);
			}
			else
			{
				if(expand_right != 0)
					doc.resizeCanvas(UnitValue(width + expand_right, 'px'), doc.height, AnchorPosition.MIDDLELEFT);
					
				width = doc.width.as('px');
				
				if(expand_left != 0)
					doc.resizeCanvas(UnitValue(width + expand_left, 'px'), doc.height, AnchorPosition.MIDDLERIGHT);
			}
			
			
			if(expand_top > expand_bottom)
			{
				if(expand_top != 0)
					doc.resizeCanvas(doc.width, UnitValue(height + expand_top, 'px'), AnchorPosition.BOTTOMCENTER);
					
				height = doc.height.as('px');
				
				if(expand_bottom != 0)
					doc.resizeCanvas(doc.width, UnitValue(height + expand_bottom, 'px'), AnchorPosition.TOPCENTER);
			}
			else
			{
				if(expand_bottom != 0)
					doc.resizeCanvas(doc.width, UnitValue(height + expand_bottom, 'px'), AnchorPosition.TOPCENTER);
					
				height = doc.height.as('px');
				
				if(expand_top != 0)
					doc.resizeCanvas(doc.width, UnitValue(height + expand_top, 'px'), AnchorPosition.BOTTOMCENTER);
			}
			
			dialog.close();
		}
		else
			alert('Document size does not match dataWindow size.');
	}
}


if(app.documents.length)
{
	var theDoc = app.activeDocument;
	
	// scan File Info > Description for image windows, courtesy ProEXR File Description
	var dataWindow = parseBox2i(theDoc.info.caption, 'dataWindow');
	var displayWindow = parseBox2i(theDoc.info.caption, 'displayWindow');
	
	// run the window, filling in values if we found them
	var dlg = makeWindow();
	
	for(var i=0; i < 4; i++)
	{
		if(dataWindow instanceof Array)
			dlg.dataWindowFields[i].text = dataWindow[i];
		
		if(displayWindow instanceof Array)
			dlg.displayWindowFields[i].text = displayWindow[i];
	}
	
	// callbacks
	dlg.OKbutton.onClick = function() { processWindows(dlg, theDoc); };
	dlg.CancelButton.onClick = function() { dlg.close(); };

	// go time
	dlg.show();
}