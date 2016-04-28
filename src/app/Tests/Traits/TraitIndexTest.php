<?php

use Illuminate\Support\Arr;

trait TraitIndexTest
{
    /**
     * A basic functional test example.
     * @test
     * @group append
     * @group normal
     * @return void
     */
    public function index002()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $expected = $this->getSortedByKey($seeder::data());
        $this->assertContentList($expected);
    }

    /**
     * 1000ユーザ
     * @group append
     * @group test
     * @return void
     */
    public function index004()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $dummy = $this->returnDummyData(100);
        foreach ($model::all() as $data) {
            $data->forceDelete();
        }
        foreach ($dummy as $data) {
            $model::create($data);
        }
        $this->assertContentList($dummy);
    }

    /**
     * 10000ユーザ
     * @group append
     * @group test
     * @return void
     */
    public function index006()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $dummy = $this->returnDummyData(10000);
        foreach ($model::all() as $data) {
            $data->forceDelete();
        }
        foreach ($dummy as $data) {
            $model::create($data);
        }
        $this->assertContentList($dummy);
    }

    /**
     * 権限チェック（一覧×、登録×、編集×、削除×、出力×）
     * @test
     * @group append
     * @group normal
     * @group index
     * @return void
     */
    public function index007()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $this->resetUserRole();
        try {
            $this->get('/api/v1/'. $url);
        } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }
    }

    /**
     * CSRFヘッダなし
     * @test
     * @group append
     * @group semi_normal
     * @group index
     * @return void
     */
    public function index009()
    {
        list($url, $seeder, $model) = $this->getKlass();

        Config::set('api.allow_ips', []);
        $headers = [];

        try {
            $this->get('/api/v1/'. $url, $headers);
        } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }
    }

    /**
     * CSRFのヘッダ情報間違い
     * @test
     * @group append
     * @group semi_normal
     * @group index
     * @return void
     */
    public function index010()
    {
        list($url, $seeder, $model) = $this->getKlass();

        Config::set('api.allow_ips', []);
        $headers = ['X-XSRF-TOKEN' => 'invalid'];

        try {
            $this->get('/api/v1/'. $url, $headers);
        } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }
    }

    /**
     * メンテナンスモード
     * @test
     * @group append
     * @group normal
     * @group index
     * @return void
     */
    public function index011()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $plugin = $this->getPluginName($model);
        $expected = $this->getSortedByKey($seeder::data());
        Config::set('maintenance.'. $plugin. '.access', false);
        Config::set('maintenance.'. $plugin. '.message', 'test');
        $this->get('/api/v1/'. $url);
        $this->seeStatusCode(503);
        $this->seeJson();
    }
}
