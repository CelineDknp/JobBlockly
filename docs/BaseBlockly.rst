How to create a *basic* Blockly task ?
======================================

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

Example : create the sum function
---------------------------------

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

Click close, then save, and you are done with the graphical interface part of the task creation. You can now visualize your task on INGInious and connect blocks, but there is no correction or feedback yet.

For the feedback, you'll have to create a ``run`` and a file that contains the task correction. Let's start with that one, that we will call ``sum.py``. It has to first get the student's code with an instruction like this : ``@@subProblemID@@``. Then, you will be able to call the created function with it's name (here "Sum"), and then run any tests you want. To comply with the usual INGInious run file, you have to output "True" if the tests pass, and some feedback followed by ``exit()`` for a failure. The following code is an example for our sum function :

.. code-block:: python

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