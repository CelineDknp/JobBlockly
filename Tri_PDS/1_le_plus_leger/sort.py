#!/bin/python3
# -*- coding: utf-8 -*-
#
#  Copyright (c)  2017 Olivier Martin
#  This program is free software: you can redistribute it and/or modify
#  it under the terms of the GNU Affero General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU Affero General Public License for more details.
#
#  You should have received a copy of the GNU Affero General Public License
#  along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
from contextlib import redirect_stdout
import random
import copy

@@leger@@


if __name__ == "__main__":
	random.seed(55)
	tab = list()
	for i in range(10):
		for j in range(10): #lists of 6 elements
			tab.append(random.randint(0,100))
		if(min(tab) != le_plus_leger(tab)):
			print("Pour la liste "+str(tab)+", tu as retourné "+str(le_plus_leger(tab)) + " alors que la bonne réponse est "+str(min(tab)))
			exit()
	print("True")	

