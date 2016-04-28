<?php

use Illuminate\Support\Arr;

trait TraitUpdateTest
{
    /**
     * 想定データ送信
     * @test
     * @group append
     * @group normal
     * @group update
     * @return void
     */
    public function update002()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $user = $model::find($this->targetId);
        $this->assertInstanceOf($model, $user);
        $this->put('/api/v1/'. $url. '/'. $user->id, $this->attributes);
        $expect = $this->getExcludedArray($this->attributes, static::$unset_columns);
        $this->seeJson($expect);
        $this->seeStatusCode(200);
    }

    /**
     * 存在しないID
     * @test
     * @group append
     * @group semi_normal
     * @group update
     * @return void
     */
    public function update007()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $this->get('/api/v1/'. $url);
        $this->seeStatusCode(200);
        $this->seeJson();
        $list = $this->response->getData(true);
        $this->assertTrue(is_array($list));

        $max = 0;
        foreach ($list as $data) {
            if ($max < $data['id']) {
                $max = $data['id'];
            }
        }
        $max += 1;
        $this->put('/api/v1/'. $url. '/'. $max, $this->attributes);
        $this->seeStatusCode(404);
        $this->seeJson();
    }

    /**
     * 権限チェック（一覧×、登録×、編集×、削除×、出力×）
     * @test
     * @group append
     * @group normal
     * @group update
     * @return void
     */
    public function update014()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $this->resetUserRole();
        try {
            $this->put('/api/v1/'. $url. '/'. $this->targetId, $this->attributes);
        } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }
    }

    /**
     * 権限チェック（一覧○、登録×、編集×、削除×、出力×）
     * @test
     * @group append
     * @group normal
     * @group update
     * @return void
     */
    public function update015()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $this->resetUserRole();
        $permissions = [
            'get_'. $url => 1,
        ];
        $this->setUserRole($permissions);
        try {
            $this->put('/api/v1/'. $url. '/'. $this->targetId, $this->attributes);
        } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }
    }

    /**
     * 権限チェック（一覧○、登録○、編集×、削除×、出力×）
     * @test
     * @group append
     * @group normal
     * @group update
     * @return void
     */
    public function update016()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $this->resetUserRole();
        $permissions = [
            'get_'. $url => 1,
            'add_'. $url => 1,
        ];
        $this->setUserRole($permissions);
        try {
            $this->put('/api/v1/'. $url. '/'. $this->targetId, $this->attributes);
        } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }
    }

    /**
     * 権限チェック（一覧○、登録○、編集×、削除×、出力○）
     * @test
     * @group append
     * @group normal
     * @group update
     * @return void
     */
    public function update017()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $this->resetUserRole();
        $permissions = [
            'get_'. $url => 1,
            'add_'. $url => 1,
            'csv_'. $url => 1,
        ];
        $this->setUserRole($permissions);
        try {
            $this->put('/api/v1/'. $url. '/'. $this->targetId, $this->attributes);
        } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }
    }

    /**
     * DB停止
     * @group append
     * @group failure
     * @group update
     * @return void
     */
    public function update068()
    {
        list($url, $seeder, $model) = $this->getKlass();
        try {
            Config::set('database.connections.invalid', [
                'driver' => 'mysql',
                'host' => 'localhost',
                'database' => 'invalid',
            ]);
            Config::set('database.default', 'invalid');
            $this->put('/api/v1/'. $url. '/'. $this->targetId, $this->attributes);
        } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }
    }

    /**
     * CSRFヘッダなし
     * @test
     * @group append
     * @group semi_normal
     * @group update
     * @return void
     */
    public function update070()
    {
        list($url, $seeder, $model) = $this->getKlass();

        Config::set('api.allow_ips', []);
        $headers = [];

        try {
            $this->put('/api/v1/'. $url. '/'. $this->targetId, $this->attributes, $headers);
        } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }
        $user = $model::find($this->targetId);
        $this->assertInstanceOf($model, $user);
    }

    /**
     * CSRFのヘッダ情報間違い
     * @test
     * @group append
     * @group semi_normal
     * @group update
     * @return void
     */
    public function update072()
    {
        list($url, $seeder, $model) = $this->getKlass();

        Config::set('api.allow_ips', []);
        $headers = ['X-XSRF-TOKEN' => 'invalid'];

        try {
            $this->put('/api/v1/'. $url. '/'. $this->targetId, $this->attributes, $headers);
        } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }
        $user = $model::find($this->targetId);
        $this->assertInstanceOf($model, $user);
    }

    /**
     * メンテナンスモード
     * @test
     * @group append
     * @group normal
     * @group update
     * @return void
     */
    public function update074()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $plugin = $this->getPluginName($model);
        $expected = $this->getSortedByKey($seeder::data());
        Config::set('maintenance.'. $plugin. '.access', false);
        Config::set('maintenance.'. $plugin. '.message', 'test');
        $this->put('/api/v1/'. $url. '/'. $this->targetId, $this->attributes);
        $this->seeStatusCode(503);
        $this->seeJson();
        $user = $model::find($this->targetId);
        $this->assertInstanceOf($model, $user);
    }
}
