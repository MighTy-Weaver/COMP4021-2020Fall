<?php

/**
*
* XML file handler
*
* The class xmlHandler is written based on the DOM functions
*
*/

class xmlHandler {

	var $filename;		// the filename of the XML file
	var $doc;			// the document of the XML file
	var $root;			// the root element node of the document

	/**
	* constructor
	*
	* @param string $filename, filename of the XML file
	*/
	function xmlHandler($filename) {
		$this->filename = $filename;
		$this->root = null;
		$this->doc = null;
	}

	/**
	* check if the XML file exist
	*
	* @return	boolean
	*/
	function fileExist() {
		return file_exists($this->filename);
	}

	/**
	* open the XML file
	*
	*/
	function openFile() {
		$rp = realpath($this->filename);

		if ($this->fileExist()) {

			$this->doc = new DOMDocument();
			$this->doc->load($rp);

			// get the root element of the document
			$this->getRootElement();
		}
		else {

			$this->doc = new DOMDocument('1.0', 'iso-8859-1');

		}
	}

	/**
	* save the XML file
	*
	*/
	function saveFile() {
		$rp = realpath($this->filename);
		$this->doc->save($rp) ;
	}

	/**
	* dump the XML tree into a string
	*
	* @return string
	*/
	function dumpToString() {
		return $this->doc->saveXML();
	}

	/**
	* add a root element node to the document
	*
	* @param string $element_name, element name
	* @return DomNode $root
	*/
	function addRootElement($element_name) {

		$this->root = $this->doc->createElement($element_name);
		$this->doc->appendChild($this->root);
		return $this->root;
	}

	/**
	* get the root element node from the document
	*
	* @return DomNode $root
	*/
	function getRootElement() {
		return $this->root;
	}

	/**
	* add an element node to an element node
	*
	* @param DomNode $element, the element node
	* @param string $child_name, the name of the to be added
	*/
	function addElement($element, $child_name) {
		$child = $this->doc->createElement($child_name);
		$element->appendChild($child);
		return $child;
	}

	/**
	* add a text node to an element node
	*
	* @param DomNode $element, the element node
	* @param string $child_text, the text of the element's text node
	*/
	function addText($element, $child_text) {
		$child_text_node = new DOMText($child_text);
		$element->appendChild($child_text_node);
	}

	/**
	* get an element node from the document
	*
	* @param string $element_name, the name of the element to be searched in the document
	* @param integer $index, the index of the element (there may be lots of element with the same name)
	* @return DomNode
	*/
	function getElement($element_name, $index=0) {
		$node_array = $this->doc->documentElement->getElementsByTagName($element_name);
		return $node_array->item($index);
	}

	/**
	* get the chlid nodes of an element node from the document
	*
	* @param string $element_name, the name of the element to be searched in the document
	* @param integer $index, the index of the element (there may be lots of element with the same name)
	* @return array, all children of the node
	*/
	function getChildNodes($element_name, $index=0) {
		$node_array = $this->doc->documentElement->getElementsByTagName($element_name);
		return $node_array;
	}

	/**
	* set an attribute of an element node
	*
	* @param DomNode $element, the element node
	* @param string $attribute_name, the name of the attribute
	* @param string $value, the value of the attribute
	*/
	function setAttribute($element, $attribute_name, $value) {
		$element->setAttribute($attribute_name, $value);
	}

	/**
	* get an attribute of an element node
	*
	* @param DomNode $element, the element node
	* @param string $attribute_name, the name of the attribute
	* @return string, the value of the attribute
	*/
	function getAttribute($element, $attribute_name) {
		return $element->getAttribute($attribute_name);
	}
	
	function removeElement($element, $child) {
		$element->removeChild($child);
	}

}

?>