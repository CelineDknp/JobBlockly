Creation of a *basic* Blockly task
==================================

There is, first, a few steps that are the same as for any other tasks. Those are :

1. Create the exercice as you would a classical one. Set up a title, a context, your name, the options you want,... When creating a subproblem, select "blockly" as "type of task"
2. Again, perform the set-up of the task as you normally would
3. If you want, set up the maximum number of blocks that the student can use to perform the task by entering it in the "Max number of blocks" field (by default, it is "Infinity")

Now, there is two ways to configure Blockly :  either using the embedded graphical interface or by entering the blocks by hand. Since the first solution is more beginner-friendly, let's explore it first. Scroll down all the way and click "edit toolbox/workspace graphically". This is what you will see.

.. image:: VisualBase/base.png
   :align: center

The left side is where you can configure the tool, and the right side will display a live preview of what you did so far. The left side has two tabs : the toolbox will hold the pool of blocks that the student can use to solve the task. To add blocks, simply click on one category and drag/drop the block you want in the tab. Here is an example :

.. image:: VisualBase/toolbox.png
   :align: center

If you want to delete a block, simply drag it to the trashcan on the bottom right. Now, you can also add blocks to the workspace of the student, that will serve as a base for the exercice. Simply click on the "workspace" tab and drag/drop the same way.

.. image:: VisualBase/workspace.png
   :align: center

Let's now see an example of what can be done for a simple exercice.

Example : create the sum function (using the graphical interface)
-----------------------------------------------------------------

Here, we are in the case where we want the student to create a function, which means we have to provide him with it's signature in the workspace. Our Sum function needs to take in two parameters, the two numbers to sum (let's call them a and b), and return the resulting sum.

First, click the "Workspace" tab and open the "Function" category. Out of the three blocks, we need the functions that returns, which is the second block on the image here.

.. image:: VisualBase/function.png
   :align: center

Now, configure the function. The wheel icons allow us to add parameters. Simply name your parameter (*x* by default), then connect the block into the right space, like so :

.. image:: VisualBase/param1.png
    :width: 49 %
.. image:: VisualBase/param2.png
    :width: 49 %

The *?* icon allows us to set a tooltip (text that show on mouseover) simply by typing in the field :

.. image:: VisualBase/tooltip.png
   :align: center

Finally, we have to name our function, changing the *do somthing* into what we want, here, *Sum* :

.. image:: VisualBase/name.png
   :align: center

Now, let's create a variable to hold the result. Click on the "Variables" category and select "create variable". Input your variable name, "result" for example, and it will be available in the category :

.. image:: VisualBase/var1.png
    :width: 39 %
.. image:: VisualBase/var2.png
    :width: 19 %
.. image:: VisualBase/var3.png
    :width: 39 %

Finally, select the corresponding block and plug it into the "return" spot. Here is our basic workspace done, with the preview :

.. image:: VisualBase/result1.png
   :align: center

Now, it is time to create the toolbox. Click on the corresponding tab, and select the blocks that you want for the task. In our case, we first need to re-create all the previous variables, the same way as we did for the *result* one (clicking on create variable). Here is what we end up with :

.. image:: VisualBase/toolVar.png
   :align: center

Then, we want the *set* block, so we drag it to the toolbox. Using the arrow next to the variable name, we can select the variable we want by default (*result* in our case) :

.. image:: VisualBase/pick.png
    :width: 49 %
.. image:: VisualBase/toolVar2.png
    :width: 49 %

Then, we add the two previously created variables "a" and "b" as well. Finally, we want the sum operator from the math category :

.. image:: VisualBase/math1.png
   :align: center

And here is the final product with the preview :

.. image:: VisualBase/finished.png
   :align: center

Click close, then save, and you are done with the graphical interface part of the task creation. You can now visualize your task on INGInious and connect blocks, but there is no correction or feedback yet. Here is what it will look like to the student :

.. image:: VisualBase/studentResult.png
   :align: center

For the feedback, you'll have to create a ``run`` and a file that contains the task correction. Let's start with that one, that we will call ``sum.py``. It has to first get the student's code with an instruction like this : ``@@subProblemID@@``. Then, you will be able to call the created function with it's name (here "Sum"), and then run any tests you want. To comply with the usual INGInious run file, you have to output "True" if the tests pass, and some feedback followed by ``exit()`` for a failure. The following code is an example for our sum function :

.. code-block:: python
    
    #!/bin/python3
    #Open source licence goes here

    from contextlib import redirect_stdout
    import random

    @@Sum@@ #The id of your subproblem goes here

    if __name__ == "__main__":
        random.seed(55)
        for j in range(6): #let's test 6 times
            a = random.randint(0,10)
            b = random.randint(0,10)
            result = Sum(a, b)
            if(result != (a+b)):
                print("The sum you returned for the values " + str(a) + " and " + str(b) + 
                " is " + str(result) + " when the correct answer is " + str(a+b) + ".")
                exit()
        print("True")



For such a simple task, the basic ``run`` file is sufficient, with only two lines to modify, where you will have to put the name of your correction file. Here is the corresponding code for our sum task:

.. code-block:: python
    
    #!/bin/python3
    #Open source licence goes here

    import os
    import subprocess
    import shlex
    from inginious import feedback
    from inginious import input


    if __name__ == "__main__":
        input.parse_template("sum.py") #Replace sum.py by your filename on this line and the next
        p = subprocess.Popen(shlex.split("python3 sum.py"), stderr=subprocess.STDOUT, stdout=subprocess.PIPE)
        make_output = p.communicate()[0].decode('utf-8')
        if p.returncode:
            feedback.set_global_result("failed")
            feedback.set_global_feedback("Your code could not be executed. Please verify that all your blocks are correctly connected.")
            exit(0)
        elif make_output == "True\n":
            feedback.set_global_result("success")
            feedback.set_global_feedback("You solved the task !")
        else:
            feedback.set_global_result("failed")
            feedback.set_global_feedback("You made a mistake ! " + make_output)


Those two files need to go in your task folder, and the task creation is complete !

Example : create the sum function by hand
-----------------------------------------

Both the toolbox and the workspace can also be created by hand (using xml code) when clicking on the "Edit toolbox XML" and "Edit workspace XML" buttons. We'll go over how to configure those two to acheive the same set up as the previous example.

First, xml tags must surround every other lines in both the toolbox and the workspace, like this :

.. code-block:: xml

    <xml xmlns="http://www.w3.org/1999/xhtml">
    </xml>

Then, for the toolbox, we need the variables *a*, *b* and *result*. The code for one variable is the following, only the content of the ``field`` tag changes to indicate the variable name. Here is the code for variable *a* :

.. code-block:: xml

  <block type="variables_get">
    <field name="VAR">a</field>
  </block>

We also need the sum operator block code, which is the following :

.. code-block:: xml

    <block type="math_arithmetic">
    <field name="OP">ADD</field>
    <value name="A">
      <shadow type="math_number">
        <field name="NUM">1</field>
      </shadow>
    </value>
    <value name="B">
      <shadow type="math_number">
        <field name="NUM">1</field>
      </shadow>
    </value>
  </block>

Each block will have different code, that you can find either online or by using the graphical interface. You can also customize a block by modifying the values (changing *ADD* for *MINUS* in the ``field`` tag will give you a minus operator block, for example).

To recapitulate, this is the full code for the toolbox :

.. code-block:: xml

    <xml xmlns="http://www.w3.org/1999/xhtml">
      <block type="math_arithmetic">
        <field name="OP">ADD</field>
        <value name="A">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="B">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
      </block>
      <block type="variables_set">
        <field name="VAR">result</field>
      </block>
      <block type="variables_get">
        <field name="VAR">a</field>
      </block>
      <block type="variables_get">
        <field name="VAR">b</field>
      </block>
      <block type="variables_get">
        <field name="VAR">result</field>
      </block>
    </xml>

Now, for the workspace, we need our function again. The arguments are specified in the ``mutation`` tag, the name under ``name`` and the tooltip under ``comment``. Finally, our result variable is specified by a special ``value`` tag, with the name *RETURN*. Here is the code for the workspace.

.. code-block:: xml

    <xml xmlns="http://www.w3.org/1999/xhtml">
      <block type="procedures_defreturn" deletable="false">
        <mutation>
          <arg name="a"></arg>
          <arg name="b"></arg>
        </mutation>
        <field name="NAME">Sum</field>
        <comment pinned="false" h="80" w="160">Return the sum of values a and b…</comment>
        <value name="RETURN">
          <block type="variables_get">
            <field name="VAR">result</field>
          </block>
        </value>
      </block>
    </xml>

At this point, we have the exact same result as in the previous example. But modifying the toolbox by hand might give you a finer control over the final display. For example, we could create a *Variable* and a *Math* category, which will make the display lighter. This can be done with ``category`` tags, like so :

.. code-block:: xml

    <xml xmlns="http://www.w3.org/1999/xhtml">
      <category name="Math">
        <block type="math_arithmetic">
          <field name="OP">ADD</field>
          <value name="A">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
          <value name="B">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
        </block>
      </category> 
      <category name="Variables"> 
          <block type="variables_set">
            <field name="VAR">result</field>
          </block>
          <block type="variables_get">
            <field name="VAR">a</field>
          </block>
          <block type="variables_get">
            <field name="VAR">b</field>
          </block>
          <block type="variables_get">
            <field name="VAR">result</field>
          </block>
      </category>
    </xml>

Here is the result from the student's point of view :

.. image:: VisualBase/cat1.png
    :width: 49 %
.. image:: VisualBase/cat2.png
    :width: 49 %

To get the full documentation about what can be acheived when modifying the toolbox manually, head to `this link <https://developers.google.com/blockly/guides/configure/web/toolbox>`_ (Google documentation).

Example : an "only workspace" task
----------------------------------

When creating a Blockly course, you might want your student to only re-order the blocks that are on the workspace rather than using a toolbox. This example will show you how to acheive that with the graphical interface. Here, we will take the very simple example of a function counting the number of occurence of a number n in a list and returns it.

First, open the graphical editor, click on the workspace tab and create a function that takes two parameters *list* and *n*, and returns a value *return* (if you are not familiar with the graphical interface use, refer to `Example : create the sum function (using the graphical interface)`_)

.. image:: VisualBase/workFun.png
    :align: center

Then, from the *Variables* category, take the "set result to" block, and set it as the first block in the body of the function. From the *Math* category, get the "0" block, to first set result to zero. Here is the current progress :

.. image:: VisualBase/workSet.png
    :align: center

Next, from the *Loops* category, get the "for each item in list" block, plug it under the last one, and get the *list* variable to add it into the bloc :

.. image:: VisualBase/workLoop.png
    :align: center

Add the "if" condition from the *Logic* category, and create our boolean `i == n` with blocks from *Logic* and *Variables*

.. image:: VisualBase/workBool.png
    :align: center

Finally, get the "change result by" block from the *Variables* sections and connect it to the body of the if. This is our correct function :

.. image:: VisualBase/workFin.png
    :align: center

Now, we can purposefully add problems that the sudent will have to solve. We could change the boolean `==` to something else, or, in our case, move the "set result to 0" block inside the loop body, like this :

.. image:: VisualBase/workFalse.png
    :align: center

Here is what the student will see on INGInious :

.. image:: VisualBase/workStud.png
    :align: center

Again, we need to create a `run` file (same as the last one, will not be detailed here) and a correction file. Here is the code for the last one :

.. code-block:: python
    
    #!/bin/python3
    # Open source licence goes here
    from contextlib import redirect_stdout
    import random

    @@count@@

    def countList(List, n):
      res = 0
      for i in List:
        if i == n:
            res += 1
      return res


    if __name__ == "__main__":
        random.seed(55)
        for i in range(6): #6 tests
            List = []
            for j in range(15): #lists of 15 elements
                List.append(random.randint(0,10))
            n = random.randint(0,10)
            correct = countList(List, n)
            output = Count(List, n)
            if(correct != output):
                print("For the list "+str(List)+ " and the number "+str(n)+ " you have returned " 
                + str(output) + " when the correct answer is " + str(correct) + ".")
                exit()
        print("True")

To make the correction and feedback easier, we defined a function giving the correct answer, and compare this function's result the the student one. We then run a few tests on random inputs. With the basic run file and this one in your task folder, it is complete.


Example : create a custom block (if/else)
-----------------------------------------

If you feel like the existing blocks do not provide enough functionalities, you can create your own and export them. To do so, head to `this link <https://blockly-demo.appspot.com/static/demos/blockfactory/index.html>`_, which is a factory allowing you to create new blocks using Blockly itself. This is the first screen :

.. image:: VisualBase/baseScreen.png
    :align: center

You will construct your block using the left side, while the right side is a live preview of both the visual and the code that will be generated. Let's construct an ``if else`` block. First, enter a name for it in the top field. It has to be unique accross all Blockly blocks, so we will call it "custom_if_else". Then, we can set a tooltip in the corresponding field, and pick a color for the block usting the "hue" block (the color won't change the behavior).

.. image:: VisualBase/blockCustom1.png
    :align: center

We will now construct the slots that our new block need. Since we are doing an ``if else`` we need to attach one boolean condition (the if condition), and two slots to put statements. This can be done with the *Input* category of the factory. There is three types of inputs : value, statement and dummy. 

The value input create slots to the right of the block to plug in blocks that return a value, this is what we need for our condition. Each input needs to have an unique name across the block, and a type that is accepted. In our case, we name the input "COND" (capitals are a convention but not mendatory), and we set the type to *boolean* using the block in the category *Type*.

.. image:: VisualBase/blockCustom2.png
    :align: center

Now, we need the slots to put the statements. Again, click on the *Input* category and drag two *statements* blocks (dummy input won't be used in this tutorial, they simply allow to add extra space to a block for annotations but are not interactive). We need to name those inputs, respectively "IF_STAT" and "ELSE_STAT".

.. image:: VisualBase/blockCustom3.png
    :align: center

Now, our block has the correct structure, but adding text to it would make it clearer. This can be done using the *Field* category. There is a lot of different field items (user input, drop down, color pickers,...), to which you can find documentation `here <https://developers.google.com/blockly/guides/create-custom-blocks/blockly-developer-tools>`_.

In our case, we need two *text* fields, one in the value input, and one in the second statement input. In the first field, we write "if", and in the second "else" (here, there is no need for the values to be unique).

.. image:: VisualBase/blockCustom4.png
    :align: center

Finally, we need to define the way our block interact with other using the connections drop-down list. Currently, *no connection* is selected, meaning that we can't plug the block into anything (this is the correct option for a function body for example). We need to be able to plug it into a block and to plug blocks after it, so we pick *top + bottom connections*, and here is our block done :

.. image:: VisualBase/blockCustom5.png
    :align: center

Now, we need to export it. First, click on the green ``Save "custom_if_else"`` button. Then, click on the ``Block Exporter`` tab :

.. image:: VisualBase/blockCustom6.png
    :align: center

Check the box next to our block name (this allows you to export multiple blocks at a time). For the generator, we need the Python version of the code, so change the language using the dropdown. For the definition, either Javascript or JSON works, it just has to be integrated differently. Pick file names (here, *custom.json* and *custom.js*), then click ``Export`` :

.. image:: VisualBase/blockCustom7.png
    :align: center

Save both files and you can close the tab, we will not use it anymore. To make it simpler, INGInious only uses one file to define all custom blocks, so we will need to copy over the code we downloaded. This is the general structure of the file we will create :

.. code-block:: javascript

  //License
  'use strict';

  Blockly.Blocks['block_name'] = {
    //JSON or javascript code for the bloc
  };

  Blockly.Python['block_name'] = function(block) {
    //Generated code for the block
    //Custom code to represent the block
    return code;
  };

For the first function, which is the block description, you can use the javascript code as it has been generated, or put the JSON into this format :

.. code-block:: javascript
  
   Blockly.Blocks['block_name'] = {
    init: function() {
      this.jsonInit({
        //JSON code for the block
      });
    }
  };

In that case, don't forget to remove the extra **[{}]** that surround the json description, as shown in the next snippet of code. Using our generated files, we get :

.. code-block:: javascript

  //License
  'use strict';

  Blockly.Blocks['block_name'] = {
    init: function() {
      this.jsonInit({
        "type": "custom_if_else",
        "message0": "if %1 %2 else %3",
        "args0": [
          {
            "type": "input_value",
            "name": "COND",
            "check": "Boolean"
          },
          {
            "type": "input_statement",
            "name": "IF_STAT"
          },
          {
            "type": "input_statement",
            "name": "ELSE_STAT"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 285,
        "tooltip": "if COND is true, execute the first block. Otherwise, execute the second",
        "helpUrl": ""
      });
    }
  };

  Blockly.Python['block_name'] = function(block) {
    var value_cond = Blockly.Python.valueToCode(block, 'COND', Blockly.Python.ORDER_ATOMIC);
    var statements_if_stat = Blockly.Python.statementToCode(block, 'IF_STAT');
    var statements_else_stat = Blockly.Python.statementToCode(block, 'ELSE_STAT');
    // TODO: Assemble Python into code variable.
    var code = '...\n';
    return code;
  };

Now, we only need to link all the parts of our block into the corresponding python code. More details on how to get the code out of a block can be found on `this link <https://developers.google.com/blockly/guides/create-custom-blocks/generating-code>`_. Here, we simply need to write the if/else structure around the part we already got in the variables and put it in a string :

.. code-block:: javascript

  Blockly.Python['block_name'] = function(block) {
    var value_cond = Blockly.Python.valueToCode(block, 'COND', Blockly.Python.ORDER_ATOMIC);
    var statements_if_stat = Blockly.Python.statementToCode(block, 'IF_STAT');
    var statements_else_stat = Blockly.Python.statementToCode(block, 'ELSE_STAT');
    var code = 'if '+value_cond+" :\n"+statements_if_stat+" \nelse:\n"+statements_else_stat+"\n";
    return code;
  };

Now, we will save all that into a file, *custom_block.js*, and head to INGInious. First, create a new task and a Blockly subproblem, then copy your file into a public directory in your task (``task_name/public``). Refresh (F5) the task edition page to see you file. Then, on the corresponding subproblem, add your file name as "Additional block file" by clicking the blue button and typing the name of the file.

.. image:: VisualBase/blockCustom8.png
    :align: center

Hit "Save changes" (top or bottom of the page), then refresh again. Now, you can use your block as any other to in your task, finding it under the *Block Library* category when using the graphical interface :

.. image:: VisualBase/blockCustom9.png
    :align: center