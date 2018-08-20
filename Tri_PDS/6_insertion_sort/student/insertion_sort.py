#!/bin/python3

#
#  Copyright (c)  2018 Ilias Boutchichi
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

A = []
B = []

def student_code():
    @@algo@@

if __name__ == "__main__":
    try:
        student_code()
    except:
        print("Unexpected error:", sys.exc_info()[0])
    correct_list = sorted(B)
    if correct_list == A:
        print('True', end='', flush=True)
    else:
        print('Vous obtenez la liste suivante: ' + str(A) + ' au lieu de: ' + str(correct_list))
