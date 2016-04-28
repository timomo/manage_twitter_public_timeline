<?php

use Illuminate\Support\Arr;

trait TraitStoreTest
{
    /**
     * リクエスト送信
     * @test
     * @group append
     * @group normal
     * @group store
     * @return void
     */
    public function store002()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $this->post('/api/v1/'. $url, $this->attributes);
        $expect = $this->getExcludedArray($this->attributes, static::$unset_columns);
        $this->seeJson($expect);
        $this->seeStatusCode(200);
    }

    /**
     * 権限チェック（一覧×、登録×、編集×、削除×、出力×）
     * @test
     * @group append
     * @group normal
     * @group store
     * @return void
     */
    public function store013()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $this->resetUserRole();
        try {
            $this->post('/api/v1/'. $url, $this->attributes);
        } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }
    }

    /**
     * CSRFヘッダなし
     * @test
     * @group append
     * @group semi_normal
     * @group store
     * @return void
     */
    public function store068()
    {
        list($url, $seeder, $model) = $this->getKlass();

        Config::set('api.allow_ips', []);
        $headers = [];

        try {
            $this->post('/api/v1/'. $url, $this->attributes, $headers);
        } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }
    }

    /**
     * CSRFのヘッダ情報間違い
     * @test
     * @group append
     * @group semi_normal
     * @group store
     * @return void
     */
    public function store070()
    {
        list($url, $seeder, $model) = $this->getKlass();

        Config::set('api.allow_ips', []);
        $headers = ['X-XSRF-TOKEN' => 'invalid'];

        try {
            $this->post('/api/v1/'. $url, $this->attributes, $headers);
        } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }
    }

    /**
     * メンテナンスモード
     * @test
     * @group append
     * @group normal
     * @group store
     * @return void
     */
    public function store072()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $plugin = $this->getPluginName($model);
        Config::set('maintenance.'. $plugin. '.access', false);
        Config::set('maintenance.'. $plugin. '.message', 'test');
        $this->post('/api/v1/'. $url, $this->attributes);
        $this->seeStatusCode(503);
        $this->seeJson();
    }
}
