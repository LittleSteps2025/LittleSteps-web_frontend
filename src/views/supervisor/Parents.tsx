import { useState, useEffect } from 'react';
import { Users, Search, Edit, Trash2, UserPlus,Send, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { X } from 'lucide-react';

type Parent = {
  id: string;
  nic: string;
  name: string;
  email: string;
  phone: string;
  children: number;
  profile_image: string;
  created_at: string;
};

type ValidationErrors = {
  nic?: string;
  name?: string;
  email?: string;
  phone?: string;
  children?: string;
  profile_image?: string;
};

const Parents = () => {
  // Sample data for demonstration
  const sampleParents: Parent[] = [
    {
      id: 'P1001',
      nic: '3008227788995',
      name: 'malith damsara',
      email: 'malith@gmail.com',
      phone: '0771234567',
      children: 2,
      profile_image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxITEhUTExMVFhUWGRcYGBgYGBUXFxgYGBcYGBUYFxgYHSghGBolGxUVITEiJSkrLi4uGB8zODMsNygtLisBCgoKDg0OGhAQGy0mICUtLS0tLi8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIALQBGQMBIgACEQEDEQH/xAAcAAABBQEBAQAAAAAAAAAAAAAAAwQFBgcCAQj/xABAEAABAwEGAwUFBgYBBAMBAAABAAIRAwQFEiExQQZRYRMicYGRBzKhscEUQlLR4fAjYnKCovFDFTNTkmPC4iT/xAAZAQACAwEAAAAAAAAAAAAAAAAAAwECBAX/xAAnEQACAgEEAgICAgMAAAAAAAAAAQIRAwQSITFBURMiMmFxgSNCkf/aAAwDAQACEQMRAD8A3FCEIAEIQgAQhCABCEIAEIQgAQhCABCEIAEIQgAQhCABI2m0spiXua0c3ED5qv8AGHFbLI3C2HVjoCe6wfiefkN1j183xWrvJfXNR0aghrROzenqqSnXReML7NsrcW2Jph1dvlJHqJTqyX7ZqnuV6bumIA+hzXza+s+YxnzcB8YSVW1vb9/KNji+SpvYz44n1M14OhBXS+feB+Pq1KqGOLqlIETJnCM5AJAIHTMaFbndN70bQzHSeHDcbg8iNkxSsVKFD9CEKxUEITW8bcyjTNR5yG25OwCG6Bcjh7gBJMDmdFEW7imxUf8AuWimDymT8FnXE3ElSu4jEABo0HTyG/Uqn2msxu2N28Z59Ss7z+jTHT+2bOePbv8A/OD5KSu7iKy18qdZhPKYPodV8/ttL/wj0CZ1bUBLnZH+UNn1GnqoWWRLwxPqAL1YlwV7UWUSKNd9V1PQGoA57PBwJLm9D5clsd3W+lXptqUnh7HaOH7yT4yTESg4jpCEKxQEIQgAQhCABCFCcWcRU7FRNR2bjIYzdzvyG/6oBDy974oWZmOtUDBtOp6NAzPkqHe/tapNMUKWLq90f4ifmsov++a1qqmrWeSToMshsGge61RjmOdkD5f6lU3MYopGrM9r9XOaFOds3CR6lPrD7XB/zWY4Z1puBy/pd+ayH/o9VzZa12W4BIKbmhaaEOwkt5wc1Xf+y2z9H05cHFdktf8A2aoLt2O7rx/adfESptfJTLeHQ9hNOo0yQCRmNHNIzC2H2W+0Z1oeLHaiDV/4qmmOBmx/82Rg7+Ot1Io4+jVEJjel6U6DZeecDcx9Oqz28/aDXc53Z4KbBkMwXHzP5BRKaiEcbl0aehY4/jK1OGdV4HNsQf7myvbPxnbKZltUvA1a8B3roR6qnzL0M+B+zY1U/aFxc2wUBhg1qhw0wdsu88jkPn5r3hfjajaiKbh2dXZpMtd/SefQrPfae/7XeLbO0T2fc/pnC6oepPcb0hWc1ttFI425UZ7br3dWqGoSajju6TLjqctT4ruz3Taq+eAyd9APzWr3bwjRptAwjIDb5Kfs13saIAWV5n4R0I6ZL8mYnR4DtTjm7zJKkqPs4cBJcZWwGzgJGrTS3lmMjhx+jFbfcr7KNJ67+IP0TvhDi11ltNOoHHsyQKg2wnJ0jlGYPl43Xi27u0p9QsntFA06hAIBGfjzTcU93Znz49j46PrZjwQCDIIkHmDoV0qr7M76+1WCkT79L+E8fzMAj1aWlWpbE7MDVHiyTjzijtahpsPcbMR7ztiRyE7/AKq38b8RmgOwYwuqVGOII2kEN8zBWX3bZHF/ZtBdWeBPQDLM/daI89c5WbLlT+q8dmvDhkqk130R9OTkWhoOxzefLYJrbWncADZswPEnMlXS18BhlPGX1HPGeFgGZ5CQSoR9xWh2TKFQbQ4EnzOSRuNG0qwqSc+8fP4dE3rg5xPhJj4BWytwFbPeIA6Bwn0lQt4XbUpd2oHA9W/kVKmijxsrYaMWYHx/NbJ7HbxwVHUM2hwybiJbIE7/AHo5cj0WS1KIDtCrfwfa3NrtcDBaWR4jM/DLzTFOqYtwtNH0QheBerYYgQhCABCEIA8cYzOi+evaFxIbVXe+f4Te6z+kHI+Ltf8AS1v2lXv9nsTwD36v8MeBBLz/AOoPqF823/ai5wpg6ZuPU7KkvQyPCs4srqld2BghpO2613g/gtrGBz2jF1zP6KnezS6+0qZDJpku+gW42ZkABZs0udqNeGNLcxmLExohrQPKEwt91scDLR6KZrpu9yzM1RZjfG3C5pzVpjMajmN/NUayW40q1OqNab2PG3uODh55LfuIqQcwrC7+sQbaiwaEg/mn6fJdxZn1WJKpLyXscU17Walerl2hJY38LM8LR0675ndNKdoBOFww8shCLmsRqw2mCS0AHYDlPXordS4BJaHGpDtYAyUSkrJhB0VZ7A2Se71Gh8U1rVjGJp7zdY5c1YL+4UrsE0ziA2/RUK2Wh9F8OaWnQg7g6xKE1LoiSceyWoXoHOBBwuB1HNWjgeqatrrVqhxPdJxHnP6BZVaaxDpB9N+RV+9mtuBtABOb2k/3DXziVM4tRZGKdzRsVON0s4BMmVRuu/t1PTEJ5SEuPRokuRR4lNazgEjeF7tY2fLLUnoqva72qQ59V4pMAnCxrqj42xRk1FWW6XJL22CVlvGV1mlVxD3HmW9DuFc7ursquDqZrwcxiY7CfmNky49sZfQMasIP0+qpB7Jk5Y74D/2H3madSrReYa8NIn8YgNz5lpj+0LZl89cM2cmzl7XDFLSB94Oa45/H4L6Ebot2Kdtr0c7UYdkYy9lI4/s57Wi9oBc7uGQTDcUzl4rzha7Gsa6qR36pJnk0ZNHoJ81O8T3c+qKbmEd1wxA7tJEkdQvKcaDQZBZ5wrJJ+zRDJuxRXohb5vWnRM1nOptOjxOEeJAgHxSV3W9wIONtak7Nr26joczI6hP72sDazHU3AFrhBa4SCmFy3K2ztwNEMEQNgAI8z1KW3QxIla1UKr8RNeWw1jXf1aD99E+tN6NxloIEcyAPUqJva8ajYY+mWh2QeCHMz57gqjdjIqjP7Xdpc4uOQ8I01y2Ce8D0jVtENzAd84AUhxWG0qOAe+/1I/eXmrN7JrgLA2QMpe8/if8AdaDybz8ORTMf2E5WouzVGheoQukcsEIQgAQhCAMe9tN5TXp0pyYzEfF5k/CmPVYhVrEvMak/MrQvafeGO3Wk7B5pj+xoZ88SpFx2MPrU888cx0b3j8AUpurY5RbpI3vg66W2azMY0ZwC47lxEk+qlbVej6be7Sk9XAfKUrZG9wAcgqtxXwrVqgllRxcXB0lzwWiM2tAOEDf9iMEXbtnRkqVIsNivbtcnU303cjBB8HDL1hLV6rWglxAA1JMBR/DNmezIg4BoHGXeZ3/VNuKHumGgHodM1DLxXgaXhfVmeS1tVpPQyPXRZBxI+LUTyE/krb2trbJdTEYow9mRLc5di2jKOap/EdOK527rfi79EzHHbMTmk3j/ALNL9lbJpEnc+vM/JaWw5LOfZpDbL2hn33CAJ0MQBzVrtN/9lGOkWg6TUpNPo5wVfLLf6okbUFU+KLnpVmw9gd8x4FWX7ZjYXBpGWh/RUS/r6eQ9x7Q02xLKIGMySBiccwCQRkqtW+C6dLkzniG4+xdhbMbT8E44KmlUo1yRhbWDCNxiAxE8hDlMW+y9o0P7GtTEf8hLsjvJORCr7LUKFUtflSrgB8CSx7TlUb1a6ctwT0T4SbTizPKEYyUvBst704d3jUdjyY2nimNySAcLeZUFY7HaA8gWdlJuIAS57nPG5LiZ8JGfRXO7zjptMgyBm05HLUHkla2FpE67c0pdGvbyMrRY29lBGYjNJWawME4WiTGIkTMaTJT2o5uF3eEbwZz5KAfe4xRTxAg76EbwPqq82NUbJr7NAzMnTYADoAoe82AdU+p2zG2Qc9wmVrYqTJ4RGULG3E1zQBhmYyxSdPLXzWh2/i2nTbMeqzW33p2BaC3EHF2msgDCAOufonNyWd9V4q2iebW/dbH1W3Sxai2c7WyUmo+i51OJ3zTa8BvbE4W5SGhpOJ3LMDL/AEu3W1tNpqPcABuVmt+29/8A1HFOTKQwDlid/wDgK9WTBaKIORa4adSCD5jNLzzbkW08Eo8kjTqOcMZOuYAj57lFrtP8M6g8jEj0UXZsNNvZF4puaMIJyY4DTEdAQMvIKMfeLDUDXFoeAcg4GW6SIKROzSoc8nFouGlaKZFRuJrp0MOE8j9Eld11Pog0S41aOWEOzcyOZ3CszGNbTaxg1Ttl2Pw4GCXuzcdmiMh4nyUxjJqkUySjHlmbXZZDbLxcSCadDID8R0a3zJJPRq2q67A2izCNd/3ykk+ZUFcnDdSnUa9zmsY3MU2ASTJMvfvscvkrQFtwQpW0c/UTTdJ2eoQhaDMCEIQAIQhAHy9x6f8A+y0t/wDmrH/IH6qP4Dq0RaXCsWABriwvMDFIiP5uXmnvGloa+2WioNDVq/MD6Km1xDpHiEpxUlQ9ScWmj6ssDe43wXdoe1oknJR/D9q7Wy0n82ifGM0wtVqw1QKuLATDSBLQdsZ2J22XObrg6UVfJP0H4tAeir9+VMNUYhkd9h4p7abY1hnFBiIOIfBVe970Dj3ngg5RnB8OarLobji7vwS9sswwdIWJcQVsdsrAaNLWjy1+JK1S8L17GyF7vutJz3jIeuSxe7HGpWcXavlx8SZ+qdpo9yM+rmlth+zYPZNag6zVKcwWVXeQcAQfmrDb+DLPUe2o4VHPDsQc5857SIzA5dTzWb+y61mlb6lE6VWf5M7w+Bd6Laa1qAZlroPFEvrJkQ+0UI2eximzs26RCgLvotZUNIkiSSNszmQD5qeqVSwYsQiM5Gp8ZyVFvq302vxVLQDniDRrPSEmV2aIK0yY4qsY7NwHLPmsb4oonC12xn/2Bhw8Mgf7lqFpvjtbM6oTAEDvCD5/BZpxgCcOFr8J73uujE7KAYiThbknafmQnVL/ABo1T2c3kKlhogGTTaGnpGQ8oCmb1rYSxx3MGdAFU/ZZcNro0XVKzDTY4DC10h5zJJLfujPfPorfeljbWp4DupywafJOHNcUNmNZUBAdiO7W9458wNPNM7bZRTENpkHYEjEYIB7omBnvClbNctEZtYxpMT3R+zqV0+yAZGI5DIH0UVwOvxZAXBZaxe59VzYMgNaDAHUk5n0Cd22pEpza7U2mMiFA2i0YjHMqjVlHKnwIWl9MOY6q4NaCczMSQY06qUuq86dTG2lLqbIBqfdLjngbOuxJ6qC4iqOp2Z9UAHBBLTo5oIxtPQtkJ3w9a6dGm2nP8Oo0VqDjq9lQzhP84MtPgt2m5g0YNVxNMg+JnkW4mMuzZHXN0qzcFX02mXUqhhrs2k6A7jpKqN61jUtL3HYADw1+ZKcWG6LRUIDWwDu7LzjVIlG5NIdCW2KbNRtzGuGxlQ1ks9BjiSGzsOZTNtlZY6XaWmq9wLmsaBJzOpDJiBmfALiy8K03htQnEajsTgARj/A0nXs2jbc+KZHSN8tlZa2lSJ6nbpdLRPLl5qzXNelOAwjC46nKHOO56pjYrta1sQg2bPulw8IH0T44lDozTyvJ2WtCQsYdgGIyUuriAQhCABCEIAE1vOvgpVHjVrXEeIBKdKo8X3k+oH2SztxPIAqO+7Tacy0n8ZECNgZMZKGyYq2fOduMl/8AVPr/AKUTWZLQeWR8Cpm9qBZUqNORBIPiCoyiJBHP6KiGs2z2e3mHWWmZyIwno9uR9Y+St4ote0yAQdZWNezW9xTc6zvPded9nbHzEDyWj2e8n0XQ6XMO41C5+RbZ0dHE90E0SFpr1KYwYRUZtiAdHqqvWp4qnaVYAbOEQAGA5uOWQOQVhr3rSIkOA8cvgsU444udaHupUSRRBgnQ1DzPJvTfdTCEsjovPNHHG65HHGvE32t4s9DOmCJI0fGkfyDWd13dfCFQAVWAugS4chzHNPfZhw12n8VzfeMD+nc+a2ey3e2izCB7hnxYdfr6LZGCS2ro58puT3S7Pn286j6FenaKeTqZBH9pIg9CDHmtj4Z4joW2lLDDiO8w+80nXxHULO+LLG1latTiQ1ziP6Tp8gqrc73isKdLGXE9zBOMHpG3NJcFNU/A6M3B/pm+1rhZIc2QQMu847RzULenDQ1cZdoMs+nipHhp9tbTaK2AmN8yPMfvqpYtJdjdqNCdB4BZW/CN0Mk0Qd2cOmmzvgOaDIbO/Mzuu7ZT7Y4aYc17YID4wztr4JZ1laK3amo+oxwjA1waAZzdIifVWWzXZQIa8NJ0IlzttCROfmm4tPu6YnLqNna/j0M7us1VtANqOLqjQZ5neBzjTXbVQ9ntgdTFTRpe5kHLC8H3T47K2V6JM7dVFG5gO1Dhio1hNRsGcWUPaBvAGm7QV0ZY1KO05kcrjLcR7rRAz2UVbr5GcR01n9+ajbwp17KYc9z6OIsZVI3BIw1Bq12WR91wII5DhtkqPzxNHWPqufJOLpnUg9ytDW0VXPMk5Jay0c04bdhG8qQstiVXIsoeWRV/2XHZazedN488Jj4r3hHh/wC13NZ2v7tSmanZv5N7Q5f0mB6BSF8UDgwNEuf3QOc5fkFcrssDaFKlQbpTY1viYlx8ySVp0dqzHrWnRndS7nUCDWZiqAAB8d065iNT1gHouKdJ73B5qvbn3Q04QBv7uvitKrWdr+64Ag7HQquXzw09oxWcTH/GTnH8p38Ct6aXgwNtjOnYm1INWXRpiJMDc581arqs/dDoiRl0Gw+SqNw1+2eKWYcXd8EQWsbm8EHScm+LlobWokyBNrElZ2zUAiE6hc5jMaylssiUQkrPVxNB9fFKqCAQhCABCF4UANrXTe8YWuwA6uHvRyby8fTmuKF306bMDBA+c6kk6nxT1cPUEo+fva/w66hX7VubK0+TxqDHMQR4FZxhIX1VxRcdK2UHUam+bXbtcNCF82X7dT7NWqUKrTjYYkaOafdcMtCFToZ2NLprhtVhOQmJ0hbBYa4fTBJmFjFnYCT/ACqa4ftFZ2IUnuxNzLSZYWjPyKz5se7k04Mm3gt3HF4dlZ3luTnd0dMWXylZFTpyYGug8TkPitJ4taatAGCCM4PgqTcdDFa7Oz8VakPI1Gz8FbTpKJXVNuSPprhDh5lms9JgGYaAfRSl5UjhxNEubOX4hu3zHxhPKRgJle1pwNLhtmtHSM/LZjnEN2vtdrcyz5ucGgA5a5EE7Rl6Kz+z7gkWOniqgG0O98/h/kb0HxPkpr2fXdifVthaAKrndnzw4iHH/ER5q42yg1wk5HmNf1SHjco8Gj5VGRCPqtYFFXpd9qtDC2nFIEHvuGcfyN59Tl4qyXddrWHGc6hnvZ5DYAEnDlr5p84ZeRU49OlzIiep8Q/6V/hq6G2Sz07PIcWgmSMySZLs95KmmkeJXdWiCR4fUJGo4M1ykwOs6LVRkuxYKC4tt1RlF1KgYr1QQx3/AIxo6ofCcupCmmulQsh7nVNZMDo1sgeROJ39yTnyOEeOx2CClLnopvCTq9MNslt/i4sTC5xJFSmW4muJP3gW4TvEHYJvUsrrJaDRJJpE9wnOWnQyNxoVdXZaCXHQchzKj70rUKTZruHhlqsssjlFJrk6GLHtl9X/AEJU7P1TsUwAopl5h8diyoRzAOGNhJy+Kmxe1JlLtKtA5R7oL5kx7s81XHFSdFszlFXRxc1hx1hVcDhZmOUjSPDMqaBkzzVdt3EVsxMNCxE0pGMudTDyw5QxodDSNcydIyVhs7g73c+Y3HjyW7EoxVJnNzOcnbR05sEFOnkZcyk32YOjEdOSUkBNsQNqN20mPdUDRjcMJdlMTMeEp1+81yai431UEiForHbIjUdOY5he2V7iRyyXTyDnqQlbqpd4nbbzz+qhkokmNgQukIUEAhCEAC8C8qOgE8l60ZIACuXLorlyglDWuFQvaXwkLZS7VgivSHdP4hnLD9Ovir9VP7/NN6AkxsVBZHynbKJBMd06OBMZjIynPDR7KsHzIILXQC7I+G+6vntV4VNOqa7G9x572WQdsT0MZnqnPBJoscx7QBSrCHDTs7QwQ4HoRBHmVRq+BqdO0Ql5W2lUZhZJJH4XDbM5hVjgqxOqXpZWAZ9qHeTJcT6NW3X3wu2oC6kADnLdJ8DsVV/Z3w/2V4PquBBbTeGgiMy5gcfIZeZSsacZUNytTjuNfDTGsfNVXiSzfaHNsbDhdVlznGXFjGjN3icmjTMqdvG3dm0NAxVX5MYCAXHz0A3KUuO7DSa51Qh9aocT3R6MbuGNGg8TqU988GdOuR7YbIyjTbTptDWMADQNAAuwf0Q9yQo1g+YzjI/6V0Ud9i72mMtdl41wPmJQAQkmu70efwMj6q5QX5JK2UwW57Fp9ClW6Bc1RIKgBvUpZwN5VTuuwVqBqMdUxU3OJpMjNgxOkYt2kiQIy00hXIHveACgbW+ahI0BgJGoa2mrSp7xKq4sHdEvPPTzPJRz6bKX8SoQTqXOj/HkFIV3ODZALiqjeFwWi0PJr1hTZs1mbvy+fgsTOlHoef8AX32hxbZqZeRkXOOGmPF35Ar2wWG3ipitApdkM8FJ5cSf5i9rctDkuLDddGzM/h1Kog7vynwiE2ujjKq+saFemMMmHiRIGhwnp1R/JZ346LM1uLOi+C3Vm3mOqUp1MTpAwVW/EeP3gkatnDgH0jDho4fIjcdP9pWvUBbJyeBtzUJ1yLaT4JCx3iHd12T+R38Es+tJIB0j9/BVS0WsksccoMFe2S+WscWYw6IPdzI8Y00W/Bl3o52fD8b4LO+0bNBz3+eq5LxmSZKrFsv14cA2kcozJbBDnQDAMxMSn121LRVLgWhmcEnMeIjotFMzkma85DIeimrqcMMDZRVO6qbRjzLuZPP5J3ZXYSFRontEwhCFBAIQhAHjhIXjDkF0mtavgyAn4BQ2lyyUm+EOSuHBMftj/wCX0P5oNudyHxCX8sRnxSFqqa2R4xHp+/qvKlvG7T5QfySV21Q57oz1/ZUqSfQOLS5OL4u7t2Fjw0tOo/XmqDbODHUZdQJO1SmcsYGbHsJybVbsdDoVrACbWmgCrNEKRSOF7/a8dlUeMbcs5afAtOYI/eyd2mz1PtrHU3tZ/CeDiaXiMTDIAcO9yTq8uGaFV4e+nLh94EtMciWkEjxSVC7jTr04qPLYcAHEGNDAJEnIHU7KCyZMXVdYa81Xlz6hyxOifhkPAQB8TLOckabsguHvVkqKN2I3laSGwNXfAblcXKDL3fd7rR4tnF8wPIphanYiTz+A2C7sVofTYGCDEmYiZJJMT1WVZo77f9Gp4mse1dvsn3EJs58Ob1y/f73URXvCq2DOXgEnabyfhnIwQ4bGWmfonR1EGKelmixt0XhK5pVQ5ocNCAR4ESEy4gdUbZa7qU9oKby2NZAnLqnmeuRS0VsLS7pHnsoEGM/NRHDNtr1KDe3qF5knMDLaJ1Piealn8isObJvfB0sOLYuexOtaoVVvniEtqCmwZxJcTk313/e6nbXABO5VSZY21XPc77zjHgAAPkqRg5jp5FBErcFoax5qPDnvP3i6Q0cmjQeSsDLzoV3YA5uIfdI18J18lTrVYHANgmApqhw9k1x3hMhp3XLEz1Ku0T1nsjaZlsgHUTI+OiZ2+pi02UkaJDIknx19VEVKeEkJGSDi9o7HNSW5DeqcoTe67EO1kAAFsGOh/VPH059F7dbsNQCJx5Dxifor6Weydeymphvha7Q+dd4IGWYy+o+ICnqQDQY/c/6TMLq7qnaQdg5xPkS1o/xJ8l1TkslKjZgJvUTgJOo1LZKJCyPlo9EsmN2OyI/fL6BPlUGCEIQAJjb9QnyZ3gNEvL+IzF+QySZXZXLlkNqG9o0XFz1IfEnPaei9tByTOx1IqDuzpnMfBWxP7EZF9S2hc1RkuWOQ962GERdoom+qRwBzRLmEOHiNR5iR5qRfUgZqNq2rEYAlQ2WSY9sVrbUpte091wn8wk61UmQN8p+aa2CwCkHYZhzi4icgTrA25+JKdnJZ55W+EaIYkuWNxZ122mF0KoSbqwkAanQblIUR25ja8Y1mANSm1Rhe0BkPxZCN/MZKUdd73EThHjsN9E7sFjo0yXMAxHIuyBPj+ibDBJvkpLURiuORS57EaVJjHEEtAGWgA0A8BA8k9cBvoiUm5y2pGBu3ZRWWM2Wq6i7JjiXUnbEfh/qAj9lO6laArFeNnp1WllRoLT6g7EHY9VSrFTqF78TXNYwua3F7z4JBfGzcoE65nSCczwfbjo3Q1K289iV4Oc7Ibg+X6pC77nOmeUAxtkPzVku+whxxHbRSNiswBfl97/6tWiOJJUjPPM5Mi6d2RRdOuR9FLCjNMeAS5Z3XBFnHcCtVCm7EcpwndRdtoyYOqm4zCr/GVepRs5rUgJY9pdIkFhkO8My3MJeXFvQ3Bl2yoQfQO6f3HdsEVXDSQwdCILvMSB0J5pe6LKalOnVqtgua12CZAkAgOO+uilnBJxYKdsdm1FrbEjb1YQxz2CSBoNT4JK6AWU2s1OZJ6kyVKOTG21OzhwGpjzWxPwYyQa4r1wyTexWnGMxCclQyDyxuh46j9/JSaiXZEHkQfzUsqFmCEIQQCbW4d1OUnXbLSFWStFoumiIXL16SuXLEzehraNFFNqNxZh3kVJ2t2ShGubiOJzB/V9FGN/cvNfQt1jtILBE+a9rV4UNdlupiWioCeTQSndQTzha3kSXJiWNtideo55gJazWcN8eaBACSrWoBZp5HI0wx10OalUAKKtlucTgYJcesADSXHYf6EnJN7Xbev75qYuqw4Q3EJc44z0AECeufxPKVbFj3u30VyzWNUuzmxXSYl7ySeQwgeA19T5BSdlsVOnm1gxc9Xf8Asc0qUpK2KKXSMUpyfbPHaeKQFFszAXteqG5uMfP0TP7S9/uCBzOZ8horlR+6oBuOiTqVE1DcM6ucdSfkuXkxmeqAOa1cZkmIUdRol5J5leNJquAHu7fmpprA0ABFEnFks+Fd2QZHq4/l9EsBASVk90dSfmVJAoBn4rxgELoarhupCgDk6pCswOBa4Ahwgg5gg6gpw4JCqgBywRAGmy6Kb2a0bHy+qWUEnLgmtUSTuBl4nf0TpwkGDB2TUue0gECBuBBHkVIAHdl3nHu8z93lPTqlWu3Jmd149zXgsOYIghw1B18QoWzWf7KS0EmkTliJ/hzoDlm3rkeqlKyCdc8RmpWi6WjwVfbW16GDzB5H81M3fUlvhkqyRI6QhCqALwoQgCGqjvFJuQhYJHRj0Rt4HJQ92sD3uDtP9oQkp1I0V9Ses9mYwd0ALtzkIUoWxpXqlRteqUIR5JXRzdlMOe2d3j/HMDwnNXOhq49Y8gBA+J9V4hdSP4o5c3cmKlFeoQDHJCFYoRlNmI97NO3mBkhCCTkCEzvA9zxIB8NfohCkDi6x3vJSgzcvEIQMWqaFJ0R3WrxCiXRC7OhqFxWyeEIUoDopnbHREIQpAZ2t0d4a6qeDUIQ+gGFqMQRsfrCUqZoQqkndLRMbwzfB0Iz9F4hSBHU3YXUo3e6kerACWz1GxU7cjjic3b8ihCmXQImEIQlgf//Z',
      created_at: '2023-05-15T10:30:00Z'
    },
    {
      id: 'P1002',
      nic: '200200907867',
      name: 'chathumini silva',
      email: 'schathumini@gmail.com',
      phone: '0772345678',
      children: 1,
      profile_image: 'data:image/jpeg;base64,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',
      created_at: '2023-06-20T14:45:00Z'
    },
    {
      id: 'P1003',
      nic: '2000123486',
      name: 'Farshad mohomad',
      email: 'farshad@gmail.com',
      phone: '0773456789',
      children: 3,
      profile_image: 'data:image/jpeg;base64,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',
      created_at: '2023-07-10T09:15:00Z'
    }
  ];

  const [parents, setParents] = useState<Parent[]>(sampleParents);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [currentParent, setCurrentParent] = useState<Parent | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Omit<Parent, 'id' | 'created_at'>>({
    nic: '',
    name: '',
    email: '',
    phone: '',
    children: 1,
    profile_image: ''
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch parents from API - using sample data for now
  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would fetch from your API
      // const token = localStorage.getItem('token');
      // const response = await fetch('/api/parents', {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // const data = await response.json();
      // setParents(data);
      
      // Using sample data for demonstration
      setTimeout(() => {
        setParents(sampleParents);
        setIsLoading(false);
      }, 500);
    } catch {
      toast.error('Failed to load parents');
      setIsLoading(false);
    }
  };

  // Search parents
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchParents();
      return;
    }
    setIsLoading(true);
    try {
      // In a real app, you would search from your API
      // const token = localStorage.getItem('token');
      // const response = await fetch(`/api/parents/search?term=${encodeURIComponent(searchTerm)}`, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // const data = await response.json();
      
      // Simulating search with sample data
      setTimeout(() => {
        const filtered = sampleParents.filter(parent => 
          parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          parent.phone.includes(searchTerm) ||
          parent.nic.includes(searchTerm)
        );
        setParents(filtered);
        setIsLoading(false);
      }, 300);
    } catch {
      toast.error('Search failed');
      setIsLoading(false);
    }
  };

  // Handle input changes for form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'children' ? Number(value) : value
    });
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          profile_image: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors: ValidationErrors = {};

    if (!formData.nic.trim()) errors.nic = 'NIC is required';
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.phone.trim()) errors.phone = 'Phone is required';
    if (!formData.children || formData.children < 1) errors.children = 'Must have at least 1 child';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open modal for adding new parent
  const openAddModal = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setFormData({
      nic: '',
      name: '',
      email: '',
      phone: '',
      children: 1,
      profile_image: ''
    });
    setValidationErrors({});
  };

  // Open modal for editing parent
  const openEditModal = (parent: Parent) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setCurrentParent(parent);
    setFormData({
      nic: parent.nic,
      name: parent.name,
      email: parent.email,
      phone: parent.phone,
      children: parent.children,
      profile_image: parent.profile_image
    });
    setValidationErrors({});
  };

  // Open delete confirmation modal
  const openDeleteModal = (parent: Parent) => {
    setIsDeleteModalOpen(true);
    setCurrentParent(parent);
  };

  // Open send message modal
  const openSendModal = (parent: Parent) => {
    setIsSendModalOpen(true);
    setCurrentParent(parent);
    setMessage('');
  };

  // Close all modals
  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsSendModalOpen(false);
    setCurrentParent(null);
    setValidationErrors({});
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      // In a real app, you would submit to your API
      // const token = localStorage.getItem('token');
      // let response;
      // if (isEditMode && currentParent) {
      //   response = await fetch(`/api/parents/${currentParent.id}`, {
      //     method: 'PUT',
      //     headers: {
      //       'Content-Type': 'application/json',
      //       'Authorization': `Bearer ${token}`,
      //     },
      //     body: JSON.stringify(formData),
      //   });
      // } else {
      //   response = await fetch('/api/parents', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //       'Authorization': `Bearer ${token}`,
      //     },
      //     body: JSON.stringify(formData),
      //   });
      // }
      // const result = await response.json();

      // Simulating API response
      const newParent = {
        id: `P${Math.floor(1000 + Math.random() * 9000)}`,
        ...formData,
        created_at: new Date().toISOString()
      };

      if (isEditMode && currentParent) {
        setParents(parents.map(p => p.id === currentParent.id ? { ...currentParent, ...formData } : p));
        toast.success('Parent updated successfully!');
      } else {
        setParents([newParent, ...parents]);
        toast.success('Parent added successfully!');
      }
      closeModal();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'An error occurred');
      } else {
        toast.error('An error occurred');
      }
    }
  };

  // Delete parent
  const deleteParent = async () => {
    if (!currentParent) return;
    try {
      // In a real app, you would call your API
      // const token = localStorage.getItem('token');
      // const response = await fetch(`/api/parents/${currentParent.id}`, {
      //   method: 'DELETE',
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });

      // Simulating deletion
      setParents(parents.filter(parent => parent.id !== currentParent.id));
      toast.success('Parent deleted successfully!');
      closeModal();
    } catch {
      toast.error('Failed to delete parent');
    }
  };

  // Send message to parent
  const sendMessage = async () => {
    if (!currentParent || !message.trim()) return;
    try {
      // In a real app, integrate with SMS/email service
      console.log(`Sending message to ${currentParent.phone}: ${message}`);
      toast.success(`Message sent to ${currentParent.name}`);
      closeModal();
    } catch {
      toast.error('Failed to send message');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
         <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c73e6] bg-clip-text text-transparent">
            Parents
          </span>
        </h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search parents..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span >Add Parent</span>
          </button>
        </div>
      </div>

      {/* Parents Table */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIC</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Children</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {parents.map((parent) => (
                <tr key={parent.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {parent.profile_image ? (
                          <img 
                            src={parent.profile_image} 
                            alt={parent.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {parent.nic}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{parent.name}</div>
                    <div className="text-sm text-gray-500">
                      Joined: {new Date(parent.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{parent.email}</div>
                    <div className="text-sm text-gray-500">{parent.phone}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {parent.children}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(parent)}
                        className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-md hover:bg-indigo-50 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openSendModal(parent)}
                        className="text-green-600 hover:text-green-900 p-1.5 rounded-md hover:bg-green-50 transition-colors"
                        title="Send Message"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(parent)}
                        className="text-red-600 hover:text-red-900 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Parent Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {isEditMode ? 'Edit Parent' : 'Add New Parent'}
                </h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500 rounded-full p-1 hover:bg-gray-100"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIC Number</label>
                  <input
                    type="text"
                    name="nic"
                    value={formData.nic}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${validationErrors.nic ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                    placeholder="NIC number"
                  />
                  {validationErrors.nic && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.nic}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${validationErrors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                    placeholder="Parent's full name"
                  />
                  {validationErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${validationErrors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                    placeholder="parent@example.com"
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${validationErrors.phone ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                    placeholder="Phone number"
                  />
                  {validationErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Children</label>
                  <input
                    type="number"
                    name="children"
                    min="1"
                    value={formData.children}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${validationErrors.children ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                    placeholder="Number of children"
                  />
                  {validationErrors.children && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.children}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                  <div className="flex items-center gap-4">
                    {formData.profile_image ? (
                      <img 
                        src={formData.profile_image} 
                        alt="Profile preview"
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                    <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      <input 
                        type="file" 
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      Choose Image
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {isEditMode ? 'Update Parent' : 'Add Parent'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Confirm Deletion</h2>
<button 
  onClick={closeModal}
  className="text-gray-400 hover:text-gray-500 rounded-full p-1 hover:bg-gray-100"
  title="Close"
>
  <X className="w-5 h-5" />
</button>

              </div>

              <p className="mb-6 text-gray-600">
                Are you sure you want to delete parent <span className="font-semibold text-gray-800">{currentParent?.name}</span>? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteParent}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {isSendModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Send Message</h2>
               <button 
  onClick={closeModal}
  className="text-gray-400 hover:text-gray-500 rounded-full p-1 hover:bg-gray-100"
  title="Close"
>
  <X className="w-5 h-5" />
</button>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  {currentParent?.profile_image ? (
                    <img 
                      src={currentParent.profile_image} 
                      alt={currentParent.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{currentParent?.name}</p>
                    <p className="text-sm text-gray-500">{currentParent?.phone}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center gap-1"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parents;