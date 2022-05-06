# IoTtalk Cyber Application

## 前言

此專案為提供一網頁平台，讓使用者能藉由手機掃描 QRCode 產生的手機感測器網頁，與顯示的網頁應用程式互動。
![Ball-throw2](https://github.com/IoTtalk/CyberApplication/blob/master/doc/images/vpython-sample.png)

此專案已事先定義好一些基本函數及資料結構，只要開發者依照指定的函數呼叫方式及資料格式，就可以快速新增應用，而不用撰寫過多的程式碼，詳細內容請參閱[新增應用](#新增-VPython-應用)。

## 基本需求

我們建議您使用 **Python >= 3.7**，而且 **pip >= 10.0.0**。

此專案的資料傳輸平台為 IoTtalk，為求使用者體驗效果良好，我們使用了 IoTtalk v2 為資料傳輸平台。

為了避免影響您原有的 Python 環境，我們也建議您使用 [Virtual enviroment](https://docs.python.org/zh-tw/3.9/tutorial/venv.html) 來執行此專案。

## 安裝方式

1. 安裝 Python 相關套件

        pip install -r requirements.txt

2. 修改設定檔 `_/settings.py`, 請替換任何 **`<xxx>`** 形式的字串為您的個人設定。
    - 設定 Django SECRET_KEY，此參數為 Django 加密用，可為任意字串

            SECRET_KEY="<your_secret_key>"

    - 設定您的 IoTtalk CSM 主機連線位置，參考格式如下

            EC_ENDPOINT = 'https://<CSM_HOST>[:<CSM_PORT>]/csm'

    - 設定您的 IoTtalk Autogen CCM API 網址，此網址可使用 Autogen 提供的 API 來操作 IoTtalk

            AG_ENDPOINT = 'https://<AG_HOST>[:<AG_PORT>]/autogen/ccm_api/'

    - 設定您的 IoTtalk Autogen 驗証方式。若您的 IoTtalk v2 server 已啟用 IoTtalk Account Subsystem (OAuth)，則請您填入已授權的 AG_ACCESS_TOKEN。否則請您填入，您當初所申請的帳號 AG_USERNAME 及密碼 AG_PASSWORD。若您不清楚所使用的主機系統，請聯絡管理員

            AG_ACCESS_TOKEN = '<iottalk_access_token>'
    
        or

            AG_USERNAME = '<iottalk_username>'
            AG_PASSWORD = '<iottalk_password>'
    
    - 設定 DEBUG 模式，在生產環境(Production Mode)，我們強烈建議您將 DEBUG 模式關閉

            DEBUG = False

3. 資料庫遷移(Django Migration)。雖然此專案並未使用任何資料模型，但我們依然建議您執行此步驟

        python manage.py migrate

4. 啟動伺服器

        python manage.py runserver

5. 檢視網頁

        https://<your_domain_or_ip>/cyberdevice/index/

## 新增 VPython 應用

以下說明，將使用 `cyberdevice/static/vp/Ball-throw2/` 作為範例。

1. 當您要新增一 VPython 應用時，應先在 `cyberdevice/static/vp/` 下建立您的應用資料夾，此平台將會自動掃描該資料夾作為應用清單的建立。

    首先在該資料夾中新增一子資料夾，`cyberdevice/static/vp/Ball-throw2/`，在該資料夾中新增相同名稱的檔案，`cyberdevice/static/vp/Ball-throw2/Ball-throw2.py`。

2. 首先，我們先來準備您的 VPython 註冊

    由於本專案使用了[iottalk-js](https://github.com/IoTtalk/iottalk-js)做為與 IoTtalk 的連線函式庫。因此您應該建立一個 `def daRegister(do_id):` 的 callback 函式。來讓系統在 project 建立後，可呼叫此函式來替您的應用程式進行 IoTtalk Device 的註冊。 

    ```
    def daRegister(do_id):
        init()

        def onRegister():
            playAudio('Startup.wav')

        profile = {
            'apiUrl': ecEndpoint,
            'deviceModel': 'Ball-throw2',
            'idfList': [],
            'odfList': [[Speed_O, ['m/s']]],
            'profile': {
                'is_sim': do_id is not None,
                'do_id': do_id,
            },
            'onRegister': onRegister,
        }
        da = new iottalkjs.DAI(profile)
        da.run()
    ```

    在此範例中，我們為此函式指定了一個參數(do_id)，這是在此平台建立完 IoTtalk Project 之後，再呼叫 Device callback 時，會提供的值。在 Device register 時提供該值，IoTtalk 將會自動連結註冊裝置到對應的 IoTalk Device Object 上。

    - **init()**

        此行呼叫了 Ball-throw2 定義的初始化函式。

    - **def onRegister()**

        定義了在 IoTtalk Device 註冊成功後的 callback 函式。

    - **profile**

        定義了 Ball-throw2 的註冊資料。

        - **apiURL**: 這裡可以直接使用 `ecEndpoint` 這個全域變數。
        - **deviceModel**: 要註冊的 IoTtalk Device Model 名稱，在此為 Ball-throw2
        - **idfList**: 此 Device Model 所用的 input Device Feature，正常來說留空即可。
        - **odfList**: 此 Device Model 所用的 output Device Feature，請依您會用到的 odf 進行填寫。本範例使用了 `Speed-O` 作為 odf，由於 iottalk-js 將直接使用給予的函式作為 odf 名稱及 callback 函式，所以請使用 `_` 代替 `-` 作為函式名稱 `def Speed_O`。
        - **profile**: 其他參數設定，請將 *do_id* 填寫在此。
        - **onRegister**: 在註冊成功後的 callback 函式

    - **da = new iottalkjs.DAI(profile)**

        將註冊資料傳送給 iottalk-js

    - **da.run()**

        執行註冊

3. 準備好 VPython 的註冊資料後，接下來要設計您的 IoTalk 完整互動應用。

    ```
    projectInit({
      'dos': {
        'smartphone': {
          'dm_name': 'Smartphone',
          'dfs': ['Acceleration-I'],
          'callback': smartphoneCallback,
        },
        'ball': {
          'dm_name': 'Ball-throw2',
          'dfs': ['Speed-O'],
          'callback': daRegister,
        }
      },
      'joins': [
        [['smartphone', 'Acceleration-I'], ['ball', 'Speed-O']]
      ]
    });
    ```
    
    此專案提供了 `projectInit` 這個函式來讀取您提供 JSON 格式的 IoTtalk Project 資料。此資料中應包含了二個部份 *dos* 及 *joins*。

    - **dos**: 定義 Project 所需的 Device Models。
    
        key 為可任意指定的名稱(do_alias_name)，供 *joins* 使用。
        value 包含三個部份
        
        - **dm_name**: 所用到的 IoTtalk Device Model 名稱
        - **dfs**: 此 Device Model 所用到的 Device Feature
        - **callback**: 當 Project 建立後所呼叫的  callback 函式。

        正常來說， *dos* 中應該至少有一個 VPython 的 Device Model 以及一個 `Smartphone`。 `Smartphone` 為本系統自帶的一感測器網頁，其中可用的 dfs 為 `Acceleration-I`, `Orientation-I` 及 `Gyroscope-I`
        
    - **joins**: 定義 Project 的資料傳輸方式。

        *joins* 使用了一個 List，來讓您可建立多個資料傳輸點(join)。
        *joins* 中的每個值同樣為一個 List，其結構為 \['<do_alias_name>', '<df_name>'\]，範例中的
        `[['smartphone', 'Acceleration-I'], ['ball', 'Speed-O']]`
        表示使用了 *smartpohne* 的 *Acceleration-I* 及 *ball* 的 *Speed-O* 來建立一個 join。
        
4. 最後尚未提到的部份為 *smartphone* 中的 callback `smartphoneCallback`

    ```
    def smartphoneCallback(do_id):
        origin = window.location.origin
        url = origin + '/cyberdevice/smartphone/' + do_id
        genQrcode(url)
    ```
    
    此平台提供了 `/cyberdevice/smartpohne/<do_id>` 做為網頁感測器，
    並且提供了 `genQrcode(<url>)` 函式讓使用者能指定畫面上 QRCode 產生的網址。
    
    **Note**: 若您的 *Smartphone* 的 <do_alias_name> 為 `smartphone`，且未設定 callback 函式，系統將自動產生預設的 QRCode 網址，可以不用特別撰寫 *smartphoneCallback*。


5. 為了確保未來新的 IoTtalk server 依然可使用此平台，請依 `model.json` 的範例，將新增的應用加入至 `model.json` 中。

    該檔案中含有二個陣列，分別是 `DeviceFeature` 及 `DeviceModel`

    - **DeviceFeature** :
        - df_name: 您所新增的 Device Feature 名稱
        - df_type: 您所新增的 Device Feture 類型，可為 `input` or `output`，正常來說應為 `output`
        - df_category: 請填 `None` 即可
        - comment: 請簡述該 Devie Feature 的用途。
        - df_parameter: 此為一個陣列，請依序填入此 Feature 所使用的數值格式，每一個數值格式需包含：
            - param_type: 參數類型，可為 `int`, `float`, `boolean`, `json`, `string`
            - min: 最小值 (若為 `json` 或 `string`，填 0 即可)
            - max: 最大值 (若為 `json` 或 `string`，填 0 即可)

    - **DeviceModel**
        - dm_name: 您所新增的 Device Model 名稱
        - df_list: 此 Device Model 所使用的 Device Feature 陣列，只需提供 Device Feature Name (df_name)，可使用系統原有的，也可以使用前述 DeviceFeature 中新增的。
